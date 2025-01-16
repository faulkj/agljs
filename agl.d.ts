declare global {
   type AGLConfig = {
      debug?: boolean
      timeout?: number
      subscribe?: { [key: string]: Record<string, any> }
      onError?: AGLEvents['error']
      onNavigate?: AGLEvents['navigate']
      onReload?: AGLEvents['reload']
      onAGLEvent?: AGLEvents['aglEvent']
      onSubscribed?: AGLEvents['subscribed']
   }

   type AGLDetails = {
      availableActions: string[]
      interfaceVersion: string | null
      readOnly: boolean
      token: string | null
      [key: string]: unknown;
   }

   type AGLEvents = {
      error: (error: { message: string | null, details: string[] }) => void
      navigate: (event: { direction: 'Back' | 'Forward' }) => void
      reload: (event: { state: string, fromHibernation: boolean }) => void
      aglEvent: (event: { name: string, args: any }) => void
      subscribed: (results: any) => void
   }
}

export { AGLConfig, AGLDetails, AGLEvents }
