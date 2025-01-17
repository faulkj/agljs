
# ***`AGL.js`*** | Epic Active Guidelines Simplified
`AGL.js` is a modern framework for integrating web applications with Epic’s Active Guidelines (AGL) platform. Built with TypeScript but fully usable with modern JavaScript, it abstracts the low-level details of AGL communication while remaining lightweight and flexible.

The framework streamlines interaction between web applications and AGL, including:

- Confirming whether the web app is running inside Epic
- Facilitating communication with the Epic backend
- Triggering and queuing actions in Hyperspace
- Subscribing to and handling AGL events
- Managing application state and navigation history


## Table of Contents
1. [Getting Started](#getting-started)
2. [Configuration](#configuration)
3. [Usage](#usage)
4. [Parameters](#parameters)
5. [Methods](#methods)
6. [Queuing](#queuing)
7. [Error Handling](#error-handling)
8. [Subscriptions](#subscriptions)
9. [State Management](#state-management)
10. [Navigation History](#navigation-history)


## Disclaimer
*`AGL.js` is not affiliated with or endorsed by Epic Systems Corporation. It is intended solely for use by organizations with active Epic licenses. Please ensure compliance with your Epic agreements before using or distributing this library.*


## Getting Started

### 📦 Installation

For **modern JavaScript/TypeScript projects**, install via **npm** or **yarn**:

```bash
# npm
npm install agljs

# yarn
yarn add agljs
```

#### TypeScript

```typescript
import AGL from 'agljs'

const agl = new AGL()

(async () => {
  if (await agl.active) {
    console.log(agl.active) //Logs true (boolean)
  }
})()
```

#### JavaScript

```javascript
import AGL from 'agljs/js/agl.js';

(async () => {
  const agl = new AGL();

  if (await agl.active) {
    console.log(agl.details.availableActions); //Logs available AGL actions
  }
})();
```

### 💾 Download

1. Download the latest release from the [GitHub repository](https://github.com/faulkj/agljs).
2. Include `agl.min.js` in your project:

```html
<script src="path/to/agl.min.js"></script>
<script>
  const agl = new AGL();

  //For browsers that don't support async/await
  Promise.resolve(agl.active).then(function(active) {
    console.log(agl.active); //Logs true or false (boolean)
  });
</script>
```


### 🔗 Via CDN

Add `AGL.js` from a CDN, such as **jsDelivr**:

```html
<script src="https://cdn.jsdelivr.net/npm/agljs/js/agl.min.js"></script>
<script>
  const agl = new AGL();

  //For browsers that don't support async/await
  Promise.resolve(agl.active).then(function(active) {
    if (active) {
      console.log(agl.details.availableActions); //Logs available AGL actions
    }
  });
</script>
```


## Configuration

The `AGL` constructor accepts an optional configuration object with the following optional parameters:

| Parameter      | Type           | Description                                                        | Default |
|----------------|----------------|--------------------------------------------------------------------|---------|
| `debug`        | `boolean`      | Enables debug logging for troubleshooting                          | `false` |
| `timeout`      | `number`       | Timeout (in milliseconds) before failure for action responses      | `2000`  |
| `subscribe`    | `object`       | An object containing events to subscribe to during the handshake   | `{}`    |
| `onError`      | `function`     | Callback for handling errors                                       | `null`  |
| `onNavigate`   | `function`     | Callback for navigation events (e.g., back/forward)                | `null`  |
| `onReload`     | `function`     | Callback for reload events                                         | `null`  |
| `onAGLEvent`   | `function`     | Callback for custom AGL events                                     | `null`  |
| `onSubscribed` | `function`     | Callback for handling subscription results                         | `null`  |

### Example Configuration
```typescript
const agl = new AGL({
   debug: true,
   timeout: 5000,
   subscribe: {
      "Epic.Common.RequestToCloseApp": { PauseDuration: 300 },
   },
   onError: (error) => console.error('Error:', error),
   onNavigate: (event) => console.log('Navigation event:', event.direction),
   onReload: (event) => console.log('Reload event:', event.state),
});
```


## Usage
All actions must wait for the AGL handshake to complete and for the framework to confirm it is running inside Epic. This is done by checking `if (await agl.active)`.

**Example**:
```typescript
const agl = new AGL();

if (await agl.active) {
   agl.do('Epic.Clinical.Informatics.Web.SaveState', { state: 'example' })
      .then((success) => console.log('State saved:', success))
      .catch((err) => console.error('Error saving state:', err));
}
```
**Example**:
```typescript
const agl = new AGL();
if (!await agl.active) throw new Error('AGL is inactive! We aren't in Epic!');

agl.on('navigate', (event) => {
   console.log('User navigated:', event.direction);
});
```


## Parameters

### `active` (read-only)
Indicates whether the `AGL.js` framework is active and initialized.

- If `AGL.js` is already initialized, returns `true` or `false`.
- If `AGL.js` is still initializing, returns a promise that resolves to `true` or `false`.

**Usage**:
Before performing any actions, ensure `AGL.js` has completed initialization:

**Example**:
```typescript
if (await agl.active) {
   console.log('AGL is initialized and ready.');
}
```

For subsequent checks (once initialization is complete), you can use `agl.active` without `await`:
```typescript
if (await agl.active) {
   console.log(agl.active ? '✔ AGL is active.' : '❌ AGL is inactive.');
}
```

### `details` (read-only)
Provides information from Epic about the current AGL context.  Properties include:

| Property            | Type          | Description                                         |
|---------------------|---------------|-----------------------------------------------------|
| `availableActions`  | `string[]`    | List of actions supported in the current context    |
| `currentState`      | `string`      | State identifier restored during hibernation        |
| `interfaceVersion`  | `string`      | Version of the AGL JavaScript interface             |
| `readOnly`          | `boolean`     | Indicates if the AGL context is read-only           |
| `token`             | `string`      | Token required for posting messages to Epic         |

Any additional properties returned by Epic will also be available.

**Example**:
```typescript
console.log('Token:', agl.details.token);
console.log('Available actions:', agl.details.availableActions.join(', '));
```

### `debug` (write-only)
Enables or disables debug logging dynamically

**Example**:
```typescript
agl.debug = true; // Enable debug logging
```


## Methods

### `do(action, args = null, haltOnError = false)`
Executes an action within AGL.

| Parameter      | Type       | Description                                                                                  |
|----------------|------------|----------------------------------------------------------------------------------------------|
| `action`       | `string`   | The name of the action to perform                                                            |
| `args`         | `object`   | *Optional*  Arguments to pass with the action                                                |
| `haltOnError`  | `boolean`  | *Optional*  Stops the queue if this action fails, preventing subsequent actions from running |

**Example**: Basic Action
```typescript
if (await agl.active) {
   agl.do('SaveState', { state: 'example' });
}
```

For convenience, actions without a full namespace (i.e., actions without a dot .) are automatically prefixed with `Epic.Clinical.Informatics.Web`.
If you need to override this behavior for specific actions, you can include the full namespace directly:

**Example**: Full Namespace Action
```typescript
if (await agl.active) {
   agl.do('Custom.Namespace.Action', { someArg: 'value' });
}
```

### `on(eventName, callback)`
Registers a callback for specific AGL events.
| Parameter       | Type       | Description                                              |
|-----------------|------------|----------------------------------------------------------|
| `eventName`     | `string`   | The name of the event to listen for                      |
| `callback`      | `function` | The callback function to execute when the event occurs   |

#### Events types:
| Event Name      | Example Response                                                      |
|-----------------|-----------------------------------------------------------------------|
| `error`         | `{ message: 'Error description', details: ['Detail 1', ...] }`        |
| `navigate`      | `{ direction: 'Back' }`                                               |
| `reload`        | `{ state: 'State string', fromHibernation: boolean }`                 |
| `aglEvent`      | `{ name: 'Event name', args:  { arg1: ... }`                          |
| `subscribed`    | `{ EventName: 'Event name', SubscriptionSuccess: boolean }`           |

**Example**:
```typescript
agl.on('navigate', (event) => {
   console.log('User navigated:', event.direction);
});
```

**Example**: Chaining listeners
```typescript
agl
   .on('navigate', (event) => console.log('User navigated:', event.direction))
   .on('reload', (event) => console.log('User reloaded:', event.state));
```


### Queuing
Actions are added to a queue and executed sequentially to avoid race conditions.
By default, the queue continues processing even if an action fails.
However, setting haltOnFail in **`do`** to `true` stops the queue when that action fails or times out, ensuring dependent actions are not executed.

**Example**:
```typescript
agl.do('SaveState', { state: 'example' }, true) // Stop queue if SaveState fails
   .catch((error) => console.error('SaveState failed:', error));

agl.do('CloseActivity', null) // Will only execute if SaveState succeeds
   .catch((error) => console.error('CloseActivity failed:', error));
```


## Advanced Usage

### Error Handling

The library provides built-in error handling.
If an error event listener is not provided, errors will default to logging in the browser's console.
If an error event listener is set, the callback will handle all errors and override default behavior.

#### Overriding Error Handling
You can override internal error handling by providing a custom `onError` callback in the configuration.

**Example**: During instantiation
```typescript
const agl = new AGL({
   onError: (error) => {
      console.error('Custom error handler:', error.message);
   },
});
```
**Example**: After instantiation
```typescript
agl.on('error', (error) => {
   console.error('Custom error handler:', error.message);
});
```

### Subscriptions
You can specify subscriptions during initialization using the `subscribe` property. Subscriptions allow your application to register for specific events, such as changes in patient demographics or requests to close the app.

#### Confirming Subscriptions
To confirm that each subscription was successfully processed during the handshake, you can define an `onSubscribed` callback. This callback receives the subscription results, allowing you to verify whether your subscriptions were accepted by Epic.

**Example**:
```typescript
const agl = new AGL({
   subscribe: {
      "Epic.Patient.Demographics.Updated": { IncludeHistory: true },
      "Epic.Common.RequestToCloseApp": { PauseDuration: 200 }
   },
   onSubscribed: (results) => {
      console.log('Subscription handshake completed:', results);
   },
});
```

#### Listening for Subscribed Events
After subscriptions are successfully established, your application can handle the events triggered by those subscriptions using the aglEvent handler.

**Example**:
```typescript
agl.on('aglEvent', (event) => {
   if (event.name === 'Epic.Patient.Demographics.Updated') {
      console.log('Patient demographics updated:', event.args);
   }
   if (event.name === 'Epic.Common.RequestToCloseApp') {
      agl.do('Epic.Common.CloseApp',  {
         CanClose: true
      });
   }
});
```


## State Management
`AGL.js` supports saving and restoring app state during transitions or hibernation.

### Saving State
To save the current state of your application, use the `SaveState` action.

**Example**: Simple string

```typescript
agl.do('SaveState', { state: 'dashboard' });
```
**Example**: Complex state

```typescript
agl.do('SaveState', {
   state: JSON.stringify({ tab: 'overview', filters: { active: true } })
});
```

### Restoring State
To restore the state during a reload event, listen for the `reload` event and activate the page accordingly.

**Example**:

```typescript
agl.on('reload', (event) => {
   if (event.state) {
      const restoredState = JSON.parse(event.state);
      console.log('Restored state:', restoredState);
      activatePage(restoredState.tab, restoredState.filters);
   }
});
```


## Navigation History

The library supports managing navigation history, tracking user interactions with Back/Forward buttons, and maintaining app-specific navigation states.


### Listening to Navigation Events
Use `onNavigate` to track Back/Forward button clicks.

**Example**:
```typescript
agl.on('navigate', ({ direction }) => {
   console.log(`Navigated: ${direction}`);
   // Handle navigation here
});
```

### Saving Navigation History
Save custom navigation states using `SaveHistoryState`. `AGL.js` will persist these states for the current session.

**Example**:
```typescript
agl.do('Epic.Clinical.Informatics.Web.SaveHistoryState', {
   state: JSON.stringify({ tab: 'dashboard', filters: { active: true } })
});
```

### Disabling Navigation Buttons
Disable Back/Forward buttons in unsupported contexts.

**Example**:
```typescript
agl.do('Epic.Clinical.Informatics.Web.SetEnabledHistBtns', {
   Back: false,
   Forward: false
});
```


## 🤝 Contributing

Contributions are welcome! Please fork the repository, create a new branch, and submit a pull request.

## ![Kopimi License](https://img.shields.io/badge/license-Kopimi-black?style=flat-square)  License
This project operates under the Kopimi ethos.  It is free to use, modify, and share.  However, if the code itself is used, borrowed, modified, or incorporated into a commercial product or service, proper attribution is required.
