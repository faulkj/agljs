/*!
 * agljs
 * Author: Joshua Faulkenberry
 * License: Kopimi
 * Copyright 2025
 */

export default class AGL {
   static #instance: AGL | null = null
   #active: boolean | null = null // null = initializing, true = active, false = inactive
   #debug: boolean = false
   #timeout: number = 2000
   #handshake: Promise<boolean> | null = null

   #queue: (() => Promise<void>)[] = []
   #processing: boolean = false

   #details: AGLDetails = {
      availableActions: [],
      interfaceVersion: null,
      readOnly: false,
      token: null
   }

   #callbacks: Partial<Record<keyof AGLEvents, (...args: any) => void>> = {}

   #subscriptions: AGLConfig['subscribe'] = {}

   #defaultPrefix = 'Epic.Clinical.Informatics.Web.'
   #errorCodes: Record<number, string> = {
      5: 'Action in progress. This means that two messages were posted back-to-back without waiting for a response from the first.',
      7: 'An action was posted which requires a token, but no token was provided.',
      9: 'An action was attempted which does not exist.',
      15: 'An action is not allowed during closing.',
      16: 'An invalid SubscriptionRequest was sent.',
      18: 'A browser launch was attempted for a URL that is not allowlisted.'
   }

   constructor(config: AGLConfig = {}) {
      const {
         debug = this.#debug,
         timeout = this.#timeout,
         subscribe = {},
         ...callbacks
      } = config
      let initial = true

      if (!AGL.#instance) AGL.#instance = this
      else {
         console.warn('[AGL] Reconfiguring existing instance. Previous settings may be overwritten.');
         initial = false
      }

      AGL.#instance.#debug = debug
      AGL.#instance.#timeout = timeout;

      (Object.keys(callbacks) as Array<keyof AGLConfig>)
         .forEach((key) => {
            if (key.startsWith('on')) {
               const eventName = key.replace(/^on/, '').toLowerCase() as keyof AGLEvents
               AGL.#instance!.#callbacks[eventName] = (callbacks as any)[key] as AGLEvents[typeof eventName]
            }
         })

      if (initial) {
         this.#subscriptions = subscribe

         if (window !== window.parent) {
            const args: Record<string, any> = {}
            if (Object.keys(this.#subscriptions).length) {
               args['SubscriptionRequests'] = []
               for (const [key, value] of Object.entries(this.#subscriptions))
                  args['SubscriptionRequests'].push({ EventName: key, EventArgs: value })
            }

            this.#handshake = this.#_do('InitiateHandshake')
               .then(() => {
                  this.#active = true
                  this.#log('Handshake complete, AGL is initialized')
                  console.log('[AGL] Initialized...')
                  return true
               })
               .catch(err => {
                  this.#active = false
                  console.error('[AGL] Handshake failed:', err.message)
                  return false
               })
         } else {
            this.#active = false
            console.log('[AGL] Not in Epic...')
            this.#log('AGL is not initialized')
         }
      }
      else return AGL.#instance
   }

   public get active(): Promise<boolean> | boolean {
      return this.#active !== null
         ? this.#active
         : this.#handshake as Promise<boolean>
   }

   public get details() {
      return this.#details
   }

   public set debug(value: boolean) {
      this.#debug = value
   }

   public on<EventName extends keyof AGLEvents>(
      eventName: EventName,
      callback: AGLEvents[EventName]
   ): this {
      this.#callbacks[eventName] = callback
      return this
   }

   public async do(
      action: string,
      args: Record<string, unknown> | null = null,
      haltOnError: boolean = false
   ): Promise<boolean> {
      return this.#active !== true
         ? Promise.resolve(false)
         : this.#_enqueue(() => this.#_do(action, args), haltOnError)
   }

   #_do(action: string, args: Record<string, unknown> | null = null): Promise<boolean> {
      const prefix = action.indexOf('.') === -1 ? this.#defaultPrefix : ''

      if (action !== 'InitiateHandshake' && !this.#details.availableActions.includes(prefix + action)) {
         const error = new Error(`Invalid action: ${action}`)
         if (this.#callbacks.error) {
            this.#callbacks.error({ message: error.message, details: [] })
            return Promise.resolve(false)
         }
         return Promise.reject(error)
      }

      return new Promise((resolve, reject) => {
         const msg: Record<string, any> = { token: this.#details.token, action: prefix + action }
         if (args) msg.args = args

         const listener = (event: MessageEvent) => {
            const { success, error } = this.#processor(event)

            window.removeEventListener('message', listener)
            if (success) resolve(true)
            else if (this.#callbacks.error) {
               this.#callbacks.error(error || { message: 'Unknown error', details: [] })
               resolve(false)
            }
            else reject(new Error(error?.message || 'Unknown error occurred'))
         }

         window.addEventListener('message', listener)
         this.#log('Sending message:', msg)
         window.parent.postMessage(msg, '*')

         setTimeout(() => {
            window.removeEventListener('message', listener)
            const timeoutError = new Error('Timeout waiting for response')
            if (this.#callbacks.error) {
               this.#callbacks.error({
                  message: 'Timeout waiting for response',
                  details: [`Action: ${msg.action}`, `Timeout: ${this.#timeout}ms`]
               })
               resolve(false)
            }
            else reject(timeoutError)
         }, this.#timeout)
      })
   }

   #processor(event: MessageEvent): { success: boolean, error?: Parameters<AGLEvents['error']>[0] } {
      this.#log('Received message:', event.data)
      if (!event.data || typeof event.data !== 'object' || !('token' in event.data || 'actions' in event.data)) {
         this.#log('Invalid message received:', event.data)
         return { success: false, error: { message: 'Invalid message format', details: [] } }
      }

      let
         success = false,
         error

      for (const type in event.data) {
         const res = this.#handle(type)(event.data[type], event.data)
         if (type === 'actionExecuted') success = res as boolean
         else if (type === 'error') error = res as Parameters<AGLEvents['error']>[0]
      }

      if (error) {
         this.#log('Error received:', error)
         this.#callbacks.error?.(error)
      }

      return { success, error }
   }

   #handle(type: string): ((p: unknown, d: Record<string, any>) => void | boolean | Parameters<AGLEvents['error']>[0]) {
      const handlers: Record<string, (p: unknown, d: Record<string, any>) => void | boolean | Parameters<AGLEvents['error']>[0]> = {
         actionExecuted: (p, d) => 'token' in d ? true : (p as boolean),
         actions: (p, d) => { this.#details.availableActions.push(...(p as string[])) },
         error: (p, d) => {
            const error: Parameters<AGLEvents['error']>[0] = { message: p as string, details: [] }
            if (d.errorCodes && d.errorCodes.length)
               error.details = this.#callbacks.error
                  ? d.errorCodes
                  : (d.errorCodes as number[]).map(code => this.#errorCodes[code] ?? `Unknown error code: ${code}`)
            return error
         },
         EventName: (p, d) => {
            this.#log('AGL event received:', p)
            this.#callbacks.aglEvent?.({ name: p as string, args: d.EventArgs ?? null })
         },
         history: (p, d) => {
            this.#log('History navigation event:', p)
            this.#callbacks.navigate?.({ direction: p as 'Back' | 'Forward' })
         },
         historyPackage: (p, d) => {
            this.#log('Received historyPackage:', p)
            const { state, fromHibernation } = p as { state: string, fromHibernation: boolean }
            this.#callbacks.reload?.({ state, fromHibernation })
         },
         isContextReadOnly: (p, d) => { this.#details.readOnly = p as boolean },
         subscriptionResults: (p, d) => {
            this.#log('Subscription results:', p)
            this.#callbacks.subscribed?.(p as unknown)
         },
         token: (p, d) => { this.#details.token = p as string },
         version: (p, d) => { this.#details.interfaceVersion = p as string },
      }

      return handlers[type] ?? ((p, d) => { this.#details[type] = p })
   }

   #_enqueue(action: () => Promise<boolean>, haltOnError: boolean = false): Promise<boolean> {
      const processQueue = () => {
         if (this.#processing || this.#queue.length === 0) return
         this.#processing = true

         this.#queue.shift()!().finally(() => {
            this.#processing = false
            processQueue()
         })
      }
      return new Promise((resolve, reject) => {
         this.#queue.push(async () => {
            try {
               const result = await action()
               resolve(result)
            } catch (error) {
               reject(error)
               if (haltOnError) {
                  console.warn('[AGL] Queue stopped due to error:', error)
                  this.#queue = []
               }
            } finally {
               processQueue()
            }
         })

         !this.#processing && processQueue()
      })
   }

   #log(...args: any[]) {
      this.#debug && console.debug('[AGL]', ...args)
   }
}
