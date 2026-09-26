![Frame 14.png](../../assets/cover.png)

# @react-native-blocks/core

Inspired by the data model behind Notion's flexibility, `@react-native-blocks/core` is the core library of [react-native-blocks](https://github.com/PatoSala/react-native-blocks/tree/main). Provides all the tools necessary to build block-based text editors like Notion. [Try it on Expo Snack](https://snack.expo.dev/@patosala/react-native-blocks?platform=ios).

<div style="width: 100%; display: flex; justify-content: center; align-items: center;">
  <img src="../../assets/react-native-blocks-core.png" width="400px"/>
</div>

## Quick start

### 1. Install in your React Native Project.

```
npm install @react-native-blocks/core
```

### 2. Install a block-component library

`@react-native-blocks/core` by it's own only provides the necessary tools to create a block based interface but does not provide the block components to be rendered. It´s up to you if you want to use an already existing set of blocks, create your own or even use both at the same time. In this example we'll be using [@react-native-blocks/blocks](https://www.npmjs.com/package/@react-native-blocks/blocks) which provides a set of blocks similar to the ones present in Notion (Pages, Headings, Checkboxes, etc).

```
npm install @react-native-blocks/blocks
```

## Example usage with [@react-native-blocks/blocks](https://www.npmjs.com/package/@react-native-blocks/blocks)

With both libraries installed we'll use from `@react-native-blocks/core` the `<Editor/>` component to create a new editor and the `<Block/>` component to register the building blocks that `<Editor/>` will use. And from `@react-native-blocks/blocks` we'll import the blocks we want to use in our editor.

```js
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import {
  Editor,
  Block
} from '@react-native-blocks/core';
import {
  PageBlock,
  TextBlock,
  ImageBlock
} from '@react-native-blocks/blocks';

const initialBlocks = {
    "1": {
      id: "1",
      type: "page",
      properties: {
          title: "@react-native-blocks/core"
      },
      format: {
        page_icon: "👋"
      },
      content: ["2", "3"],
      parent: "root"
    },
    "2": {
      id: "2",
      type: "text",
      properties: {
          title: "The core library of react-native-blocks. Provides all the necessary tools to build block-based text editors like Notion."
      },
      content: [],
      parent: "1"
    },
    "3": {
      id: "3",
      type: "image",
      properties: {
          source: "https://raw.githubusercontent.com/PatoSala/react-native-blocks/8862145f6a3fb6ecc055445da92f265d02069283/assets/logo-small-white.png"
      },
      format: {
        block_aspect_ratio: 1,
        block_width: 1024
      },
      content: [],
      parent: "1"
    }
}

export default function App() {

  const handleChange = ({ updated, removed }) => {
    console.log("updated", Object.keys(updated), "removed", removed);
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1}} edges={["top"]}>
        <Editor          
          defaultBlocks={blankNote}
          onChange={handleChange}
        >
          <Block
            type="text"
            component={TextBlock}
            options={{
              isTextBased: true,
              name: "Text"
            }}
          />

          <Block
            type="page"
            component={PageBlock}
            options={{
              isTextBased: true,
              name: "Page"
            }}
          />

          <Block
            type="image"
            component={ImageBlock}
            options={{
              name: "Image"
            }}
          />
        </Editor>

        <StatusBar style="auto" />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
```

## Saving changes

`<Editor/>` has no save button. Pass `onChange` and it fires after the page is edited, including while typing:

```js
<Editor
  defaultBlocks={initialBlocks}
  onChange={({ updated, removed, getBlocks }) => {
    // updated: blocks created or modified since the last change, keyed by id.
    // removed: ids of blocks removed since the last change (nested blocks included).
    // getBlocks(): the whole page, with the same shape as `defaultBlocks`.
    savePage(pageId, { updated, removed });
  }}
>
```

- Edits are batched: `onChange` fires once no edit happened for 500ms, not on every keystroke.
- Pending edits are reported right away when the app leaves the foreground or the editor unmounts.
- `updated`, `removed` and `getBlocks()` are copies, so you can keep them or send them as they are.
- `onChange` does not retry. If a save fails, keep its `updated` and `removed` and merge them into the next save (or save `getBlocks()` instead), and send saves one at a time so they reach your back-end in order.

## Warning
This library is still a work in progress so expect breaking changes on future releases. If you have any doubts you can join our [Discord server](https://discord.gg/utxtAafD8n).