#agljs

## Examples

### 📦 Installation

For **modern JavaScript/TypeScript projects**, install via **npm** or **yarn**:

```bash
# npm
npm install agljs

# yarn
yarn add agljs
```

#### JavaScript

```javascript
import agl from 'agljs/js'

(() {
  const myagl = new agl();

  if (await myagl.active) {
    console.log(myagl.details.availableActions);
  }
})();
```

#### TypeScript

```typescript
import agl from 'agljs'

const myagl = new agl()

(() {
  if (await myagl.active) {
    console.log(myagl.active) //Logs true (boolean)
  }
})()
```

### 💾 Download

1. Download the latest release from the [GitHub repository](https://github.com/faulkj/agljs).
2. Include `agl.min.js` in your project:

```html
<script src="path/to/agl.min.js"></script>
<script>
  const myagl = new agl();

  Promise.resolve(myagl.active).then(function(active) {
    console.log(myagl.active); //Logs true or false (boolean)
  });
</script>
```

---

### 🔗 Via CDN

Add `agljs` from a CDN like **jsDelivr**:

```html
<script src="https://cdn.jsdelivr.net/npm/agljs/agl.min.js"></script>
<script>
  const myagl = new agl();

  Promise.resolve(myagl.active).then((active) => {
    if (active) {
      console.log(myagl.details.availableActions);
    }
  });
</script>
```

---
