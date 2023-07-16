<template>
  <div class="report-editor">
    <div v-if="editor">
      <div class="checkbox">
        <input type="checkbox" id="manageCenter" v-model="manageCenter" />
        <label for="editable">manageCenter</label>
      </div>
      <div class="checkbox">
        <input type="checkbox" id="editable" v-model="editable" />
        <label for="editable">editable</label>
      </div>
      <div class="checkbox">
        <input type="checkbox" id="reviewMode" v-model="reviewMode" />
        <label for="reviewMode">reviewMode</label>
      </div>
      <button
        @click="editor.chain().focus().toggleBold().run()"
        :disabled="!editor.can().chain().focus().toggleBold().run()"
        :class="{ 'is-active': editor.isActive('bold') }"
      >
        bold
      </button>
      <button
        @click="editor.chain().focus().toggleItalic().run()"
        :disabled="!editor.can().chain().focus().toggleItalic().run()"
        :class="{ 'is-active': editor.isActive('italic') }"
      >
        italic
      </button>
      <button
        @click="editor.chain().focus().toggleStrike().run()"
        :disabled="!editor.can().chain().focus().toggleStrike().run()"
        :class="{ 'is-active': editor.isActive('strike') }"
      >
        strike
      </button>
      <button
        @click="editor.chain().focus().toggleCode().run()"
        :disabled="!editor.can().chain().focus().toggleCode().run()"
        :class="{ 'is-active': editor.isActive('code') }"
      >
        code
      </button>
      <button @click="editor.chain().focus().unsetAllMarks().run()">
        clear marks
      </button>
      <button @click="editor.chain().focus().clearNodes().run()">
        clear nodes
      </button>
      <button
        @click="editor.chain().focus().setParagraph().run()"
        :class="{ 'is-active': editor.isActive('paragraph') }"
      >
        paragraph
      </button>
      <button @click="editor.chain().focus().toggleTitleNumber().run()"
      >
    标题编号
    </button>
      <button
        @click="editor.chain().focus().toggleHeading({ level: 1 }).run()"
        :class="{ 'is-active': editor.isActive('heading', { level: 1 }) }"
      >
        h1
      </button>
      <button
        @click="editor.chain().focus().toggleHeading({ level: 2 }).run()"
        :class="{ 'is-active': editor.isActive('heading', { level: 2 }) }"
      >
        h2
      </button>
      <button
        @click="editor.chain().focus().toggleHeading({ level: 3 }).run()"
        :class="{ 'is-active': editor.isActive('heading', { level: 3 }) }"
      >
        h3
      </button>
      <button
        @click="editor.chain().focus().toggleHeading({ level: 4 }).run()"
        :class="{ 'is-active': editor.isActive('heading', { level: 4 }) }"
      >
        h4
      </button>
      <button
        @click="editor.chain().focus().toggleHeading({ level: 5 }).run()"
        :class="{ 'is-active': editor.isActive('heading', { level: 5 }) }"
      >
        h5
      </button>
      <button
        @click="editor.chain().focus().toggleHeading({ level: 6 }).run()"
        :class="{ 'is-active': editor.isActive('heading', { level: 6 }) }"
      >
        h6
      </button>
      <button
        @click="editor.chain().focus().toggleBulletList().run()"
        :class="{ 'is-active': editor.isActive('bulletList') }"
      >
        bullet list
      </button>
      <button
        @click="editor.chain().focus().toggleOrderedList().run()"
        :class="{ 'is-active': editor.isActive('orderedList') }"
      >
        ordered list
      </button>

      <button v-for="option in options" :key="option.type"
      @click="editor.isActive('ppOrderedList')
                ? execCommand('setPPorderedListType', {
                  listStyle: option.type,
                  class: option.class,
                  type: option.level
                })
                : execCommand('togglePPorderedList', {
                    listStyle: option.type,
                    class: option.class,
                    type: option.level
                  })"
     :class="{ 'is-active': editor.isActive('ppOrderedList') &&  option.level == activeLevel}"
      >{{option.content}}</button>

      <button
        @click="editor.chain().focus().toggleCodeBlock().run()"
        :class="{ 'is-active': editor.isActive('codeBlock') }"
      >
        code block
      </button>
      <button
        @click="editor.chain().focus().toggleBlockquote().run()"
        :class="{ 'is-active': editor.isActive('blockquote') }"
      >
        blockquote
      </button>
      <button @click="editor.chain().focus().setHorizontalRule().run()">
        horizontal rule
      </button>
      <button @click="editor.chain().focus().setHardBreak().run()">
        hard break
      </button>
      <button
        @click="editor.chain().focus().undo().run()"
        :disabled="!editor.can().undo()"
      >
        undo
      </button>
      <button
        @click="editor.chain().focus().redo().run()"
        :disabled="!editor.can().redo()"
      >
        redo
      </button>
    </div>
    <editor-content :editor="editor" />
  </div>
</template>

<script lang="ts" setup>
import { Editor, EditorContent, findParentNode, isList } from "@tiptap/vue-2";
import StarterKit from "@tiptap/starter-kit";
import ListItem from  "@tiptap/extension-list-item";
import { markRaw, ref, onBeforeUnmount, watch, shallowRef, computed } from "vue";
import { Review, ReviewDeletionMark } from "./nodes/review";
import { numbersExtension } from "./nodes/numbers"
import History from "@tiptap/extension-history";
import { ppOrderedList } from "./nodes/cusOrederList/ppOrderList";

const manageCenter = ref(true)

const editable = ref(true);

const reviewMode = ref(true);

const options = ref([
        {
          type: "none",
          content:"正文",
          level:"title-normal",
          class:"t-6"
        },
        {
          type: "decimal",
          content:"1.标题一",
          level:"title-1",
          class:"t-1"
        },
        {
          type: "lower-roman",
          content:"i. 标题二",
          level:"title-2",
          class:"t-2"
        },
        {
          type: "trad-chinese-informal",
          content:"一、标题三",
          level:"title-3",
          class:"t-3"
        },
        {
          type: "lower-latin",
          content:"a. 标题四",
          level:"title-4",
          class:"t-4"
        },
        {
          type: "disc",
          content:"• 标题五",
          level:"title-5",
          class:"t-5"
        }
      ])
interface ppOrderedList {
  listStyle:string
  class:string
  type:string
}
const execCommand= (cmd:string, orderedList:ppOrderedList) => {
  console.log('Button clicked',cmd,editor.value.chain().focus());
  if(cmd == 'setPPorderedListType'){
    const { extensions } = editor.value.extensionManager;
    const { selection } = editor.value.state;
    const { $from, $to } = selection
    const range = $from.blockRange($to) ;
    const node = $from.node();
const parentList = findParentNode(node => isList(node.type.name, extensions))(selection);
const oldTitleLevel = parentList?.node.attrs.class.split('-')[1]
const newTitlelevel = orderedList.class.split('-')[1]
  
  if(newTitlelevel > oldTitleLevel){
    if(editor.value.can().sinkListItem('listItem')){
      console.log("sinkListItem::::::::::")
      editor.value.chain().focus().sinkListItem('listItem').run()
    }
  }else if(newTitlelevel < oldTitleLevel){
    if(editor.value.can().liftListItem('listItem')){
      editor.value.chain().focus().liftListItem('listItem').run()
      console.log("liftListItem::::::::::",editor.value.isActive('ppOrderedList') )
      if(!editor.value.isActive('ppOrderedList')){
        editor.value.chain().wrapInList('ppOrderedList',{orderedList}).run()
      }
    }
  }
  }
    editor.value.chain()[cmd](orderedList).focus().run();
};

const activeLevel = ref("")

watch(editable, (value) => {
  editor.value.setEditable(value);
});

watch(manageCenter,(value) => {
  if (value) {
    editor.value.chain().setManageCenterMode().focus().run()
  } else {
    editor.value.chain().unsetManageCenterMode().focus().run()
  }
});
watch(reviewMode, (value) => {
  if (value) {
    editor.value.chain().setReviewMode().focus().run()
  } else {
    editor.value.chain().unsetReviewMode().focus().run()
  }
});


const editor = ref(
  new Editor({
    editable: editable.value,
    extensions: [
      StarterKit,
      numbersExtension,
      ListItem.configure({
  HTMLAttributes: {
    class: 'my-custom-class',
  },
}),
      Review.configure({
        enable: reviewMode.value,
      }),
      ppOrderedList
    ],
    content: `
    <h1>
          这是一级标题
        </h1>
        <h2>
          这是二级标题
        </h2>
        <h3>
          这是三级标题
        </h3>
        <h4>
          这是四级标题
        </h4>
        <h5>
          这是五级标题
        </h5>
        <h5>
          这是五级标题
        </h5>
        <h5>
          这是五级标题
        </h5>
        <h5>
          这是五级标题
        </h5>
        <h5>
          这是五级标题
        </h5>
        <p>
          this is a <em>basic</em> example of <strong>tiptap</strong>. Sure, there are all kind of basic text styles you’d probably expect from a text editor. But wait until you see the lists:
        </p>
        <ol style="list-style-type:lower-alpha;">
          <li>
            That’s a bullet list with one …
          </li>
          <li>
            … or two list items.
          </li>
        </ol>
        <h1>
          这是一级标题
        </h1>
        <h2>
          这是二级标题
        </h2>
        <h3>
          这是三级标题
        </h3>
        <h3>
          这是三级标题
        </h3>
        <h3>
          这是三级标题
        </h3>
        <h3>
          这是三级标题
        </h3>
        <p>
          Isn’t that great? And all of that is editable. But wait, there’s more. Let’s try a code block:
        </p>
        <pre><code class="language-css">body {
  display: none;
}</code></pre>
<h2>
          这是二级标题
        </h2>
        <h2>
          这是二级标题
        </h2>
        <h2>
          这是二级标题
        </h2>
        <h2>
          这是二级标题
        </h2>
        <h2>
          这是二级标题
        </h2>
        <h2>
          这是二级标题
        </h2>
        <h2>
          这是二级标题
        </h2>
        <h2>
          这是二级标题
        </h2>
        <h2>
          这是二级标题
        </h2>
        <h2>
          这是二级标题
        </h2>
        <h2>
          这是二级标题
        </h2>
        <h4>
          这是四级标题
        </h4>
        <h4>
          这是四级标题
        </h4>
        <h4>
          这是四级标题
        </h4>
        <h4>
          这是四级标题
        </h4>
        <p>
          I know, I know, this is impressive. It’s only the tip of the iceberg though. Give it a try and click a little bit around. Don’t forget to check the other examples too.
        </p>
        <blockquote>
          Wow, that’s amazing. Good work, boy! 👏
          <br />
          — Mom
        </blockquote>
        <table>
    <thead>
      <tr>
        <th>Header 1</th>
        <th>Header 2</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Cell 1</td>
        <td>Cell 2</td>
      </tr>
      <tr>
        <td>Cell 3</td>
        <td>Cell 4</td>
      </tr>
    </tbody>
  </table>
  <h1>
          这是一级标题
        </h1>
  <h1>
          这是一级标题
        </h1>
        <h4>
          这是四级标题
        </h4>
        <h5>
          这是五级标题
        </h5>
        <h5>
          这是五级标题
        </h5>
        <h5>
          这是五级标题
        </h5>
        <h5>
          这是五级标题
        </h5>
        <h5>
          这是五级标题
        </h5>
        <h5>
          这是五级标题
        </h5>
        <h5>
          这是五级标题
        </h5>
        <h5>
          这是五级标题
        </h5>
        <h5>
          这是五级标题
        </h5>
        <h4>
          这是四级标题
        </h4>
        <h4>
          这是四级标题
        </h4>
        <h4>
          这是四级标题
        </h4>
        <h1>
          这是一级标题
        </h1>
        <h1>
          这是一级标题
        </h1>
        <h1>
          这是一级标题
        </h1>
        <h1>
          这是一级标题
        </h1>
        <h1>
          这是一级标题
        </h1>
        <h1>
          这是一级标题
        </h1>
        <h1>
          这是一级标题
        </h1>
        <h1>
          这是一级标题
        </h1>
        <h1>
          这是一级标题
        </h1>
        <h1>
          这是一级标题
        </h1>
        <h1>
          这是一级标题
        </h1>
        <h4>
          这是四级标题
        </h4>
        <h4>
          这是四级标题
        </h4>
        <h4>
          这是四级标题
        </h4>
        <h1>
          这是一级标题
        </h1>
        <h1>
          这是一级标题
        </h1>
        <h1>
          这是一级标题
        </h1>
        <h1>
          这是一级标题
        </h1>
        <h1>
          这是一级标题
        </h1>
        <h3>
          这是三级标题
        </h3>
        <h3>
          这是三级标题
        </h3>
        <h3>
          这是三级标题
        </h3>
        <h3>
          这是三级标题
        </h3>
        <h1>
          这是一级标题
        </h1>
        <h1>
          这是一级标题
        </h1>
        <h1>
          这是一级标题
        </h1>
        <h1>
          这是一级标题
        </h1>
        <h4>
          这是四级标题
        </h4>
        <h1>
          这是一级标题
        </h1>
        <h1>
          这是一级标题
        </h1>
        <h1>
          这是一级标题
        </h1>
        <h1>
          这是一级标题
        </h1>
        <h3>
          这是三级标题
        </h3>
  <h2>
          这是二级标题
        </h2>
        <h3>
          这是三级标题
        </h3>
        <h3>
          这是三级标题
        </h3>
        <h3>
          这是三级标题
        </h3>
      `,
      onBeforeCreate({ editor }) {
    // Before the view is created.
  },
  onCreate({ editor }) {
    // The editor is ready.
  },
  onUpdate({ editor }) {
    // The content has changed.
    console.log("onSelectionUpdate:::")
    // The selection has changed.
    const { $from } = editor.state.selection;
    const { extensions } = editor.extensionManager;
    const { selection } = editor.state;
   const node = $from.node();
   const parentList = findParentNode(node =>
          isList(node.type.name, extensions)
        )(selection);
        if (
          parentList &&
          parentList.node.type.name == "ppOrderedList"
        ){
          activeLevel.value = parentList.node.attrs.type
        }

  console.log('Current node:', parentList,activeLevel.value);
  },
  onSelectionUpdate({ editor }) {

  },
  onTransaction({ editor, transaction }) {
    // The editor state has changed.
    editor.state.doc.descendants((node, pos) => {
    const { marks } = node
    marks.forEach((mark) => {
      // if(mark.type.name=='reviewDeletion' || 'reviewInsertion'){
      //   console.log(mark)
      // }
    })
  })
  },
  onFocus({ editor, event }) {
    // The editor is focused.
  },
  onBlur({ editor, event }) {
    // The editor isn’t focused anymore.
  },
  onDestroy() {
    // The editor is being destroyed.
  },
  })
);

onBeforeUnmount(() => {
  editor.value.destroy();
});
</script>

<style lang="less" scoped>
.report-editor {
  box-sizing: border-box;
  border: 1px solid black;
}
.is-active{
  background: gray;
}
</style>

<style lang="less">
.ProseMirror-focused:focus {
  outline: none;
}

ol.my-custom-class {
  list-style: none; /* 隐藏默认的列表标记 */
  counter-reset: my-counter; /* 初始化计数器 */
}

ol.my-custom-class li {
  position: relative;
  padding-left: 2em; /* 根据需要调整缩进 */
  margin-bottom: 0.5em; /* 根据需要调整行间距 */
}

ol.my-custom-class li:before {
  content: counter(my-counter, upper-alpha); /* 使用计数器的值作为标记内容 */
  counter-increment: my-counter; /* 递增计数器 */
  position: absolute;
  top: -0.8em; /* 上标效果的位置调整 */
  left: 0;
  font-size: 0.8em; /* 上标效果的字体大小调整 */
}
</style>
