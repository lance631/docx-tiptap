import { mergeAttributes, Node, wrappingInputRule, getNodeType } from '@tiptap/core'
import { findParentNode, isList } from "@tiptap/vue-2";
import { canJoin } from "prosemirror-transform";
import ListItem  from './listItem'
import  TextStyle from './textStyle'

export interface ppOrderedListOptions {
  itemTypeName: string,
  HTMLAttributes: Record<string, any>,
  keepMarks: boolean,
  keepAttributes: boolean,
}

export interface ppOrderedListAttrs {
  listStyle: string,
  class: string,
  type: string
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    ppOrderedList: {
      /**
       * Toggle an ordered list
       */
      togglePPorderedList: (attributes:ppOrderedListAttrs) => ReturnType,
    }
  }
}

const joinListBackwards = (tr, listType) => {
  const list = findParentNode(node => node.type === listType)(tr.selection);

  if (!list) {
    return true;
  }

  const before = tr.doc.resolve(Math.max(0, list.pos - 1)).before(list.depth);

  if (before === undefined) {
    return true;
  }

  const nodeBefore = tr.doc.nodeAt(before);
  const canJoinBackwards =
    list.node.type === nodeBefore?.type && canJoin(tr.doc, list.pos);

  if (!canJoinBackwards) {
    return true;
  }

  tr.join(list.pos);

  return true;
};

const joinListForwards = (tr, listType) => {
  const list = findParentNode(node => node.type === listType)(tr.selection);

  if (!list) {
    return true;
  }

  const after = tr.doc.resolve(list.start).after(list.depth);

  if (after === undefined) {
    return true;
  }

  const nodeAfter = tr.doc.nodeAt(after);
  const canJoinForwards =
    list.node.type === nodeAfter?.type && canJoin(tr.doc, after);

  if (!canJoinForwards) {
    return true;
  }

  tr.join(after);

  return true;
};

export const inputRegex = /^(\d+)\.\s$/

export const ppOrderedList = Node.create<ppOrderedListOptions>({
  name: 'ppOrderedList',

  addOptions() {
    return {
      itemTypeName: 'listItem',
      HTMLAttributes: {},
      keepMarks: false,
      keepAttributes: false,
    }
  },

  group: 'block list',

  content() {
    return `${this.options.itemTypeName}+`
  },

  addAttributes() {
    return {
      start: {
        default: 1,
        parseHTML: element => {
          return element.hasAttribute('start')
            ? parseInt(element.getAttribute('start') || '', 10)
            : 1
        },
      },
      listStyle: {
        default: null,
        parseHTML: el => el.style?.listStyle,
        renderHTML: attributes => {
          console.log('listStyle:::',attributes)
          return attributes.listStyle
            ? {
                style: "list-style: " + attributes.listStyle + ";"
              }
            : {};
        }
      },
      class: {
        default: null,
        parseHTML: el => el.className,
        renderHTML: attributes => {
          return attributes.class
            ? {
                class: attributes.class
              }
            : {};
        }
      },
      type:{
        default: null,
        parseHTML: el => el.dataset.type,
        renderHTML: attributes => {
          console.log('type:::',attributes)
          return attributes.type
            ? {
                "data-type": attributes.type
              }
            : {};
        }
      }

    }
  },

  parseHTML() {
    return [
      {
        tag: 'ol',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    console.log('HTMLAttributes:::',HTMLAttributes)
    const { start, ...attributesWithoutStart } = HTMLAttributes

    return start === 1
      ? ['ol', mergeAttributes(this.options.HTMLAttributes, attributesWithoutStart), 0]
      : ['ol', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0]
  },

  addCommands() {
    return {
      togglePPorderedList: (attrs:ppOrderedListAttrs) => ({ commands, chain }) => {
        console.log("togglePPorderedList:::",attrs)
        if (this.options.keepAttributes) {
          return chain().toggleList(this.name, this.options.itemTypeName, this.options.keepMarks).updateAttributes(ListItem.name, this.editor.getAttributes(TextStyle.name)).run()
        }
        return commands.toggleList(this.name, this.options.itemTypeName, this.options.keepMarks, attrs)
      },

      setPPorderedListType: listStyle => ({ editor, tr, state }) => {




        const { extensions } = editor.extensionManager;
        const { selection } = state;
        const { $from, $to } = selection;
        const range = $from.blockRange($to);

        if (!range) {
          return false;
        }

        //sink list or lift list
        // const parentList_before = findParentNode(node =>
        //   isList(node.type.name, extensions)
        // )(selection);

        // if(parentList_before.node.attrs.class.split('-')[1]>listStyle.class.split('-')[1]){
        //   if(editor.can().sinkListItem('listItem')){
        //     editor.chain().focus().sinkListItem('listItem').run()
        //   }
        // }


        const parentList = findParentNode(node =>
          isList(node.type.name, extensions)
        )(selection);
       console.log('parentList:::',parentList)
        tr.setNodeMarkup(parentList?.pos, null, {
          ...parentList?.node.attrs,
          ...listStyle
        });

        //editor.view.dispatch(tr);
      },

      toggleList: (listTypeOrName, itemTypeOrName, keepMarks, attrs) => ({
        editor,
        tr,
        state,
        dispatch,
        chain,
        commands,
        can
      }) => {

        const { extensions } = editor.extensionManager;
        const listType = getNodeType(listTypeOrName, state.schema);
        const itemType = getNodeType(itemTypeOrName, state.schema);
        const { selection } = state;
        const { $from, $to } = selection;
        const range = $from.blockRange($to);
        console.log('toggleList:::',range,attrs)
        if (!range) {
          return false;
        }

        const parentList = findParentNode(node =>
          isList(node.type.name, extensions)
        )(selection);

        if (
          range.depth >= 1 &&
          parentList &&
          range.depth - parentList.depth <= 1
        ) {
          // remove list
          if (parentList.node.type === listType) {
            return commands.liftListItem(itemType);
          }

          // change list type
          if (
            isList(parentList.node.type.name, extensions) &&
            listType.validContent(parentList.node.content) &&
            dispatch
          ) {
            return chain()
              .command(() => {
                console.log("setNodeMarkup:::",attrs)
                tr.setNodeMarkup(parentList.pos, listType, attrs);

                return true;
              })
              .command(() => joinListBackwards(tr, listType))
              .command(() => joinListForwards(tr, listType))
              .run();
          }
        }

        return (
          chain()
            // try to convert node to default node if needed
            .command(() => {
              const canWrapInList = can().wrapInList(listType, attrs);

              if (canWrapInList) {
                return true;
              }
              console.log("canWrapInList:::",listType,attrs)
              return commands.clearNodes();
            })
            .wrapInList(listType, attrs)
            .command(() => joinListBackwards(tr, listType))
            .command(() => joinListForwards(tr, listType))
            .run()
        );
      },
    }
  },

  addKeyboardShortcuts() {
    return {
      'Mod-Shift-7': () => this.editor.commands.togglePPorderedList(),
    }
  },

  addInputRules() {
    let inputRule = wrappingInputRule({
      find: inputRegex,
      type: this.type,
      getAttributes: match => ({ start: +match[1] }),
      joinPredicate: (match, node) => node.childCount + node.attrs.start === +match[1],
    })

    if (this.options.keepMarks || this.options.keepAttributes) {
      inputRule = wrappingInputRule({
        find: inputRegex,
        type: this.type,
        keepMarks: this.options.keepMarks,
        keepAttributes: this.options.keepAttributes,
        getAttributes: match => ({ start: +match[1], ...this.editor.getAttributes(TextStyle.name) }),
        joinPredicate: (match, node) => node.childCount + node.attrs.start === +match[1],
        editor: this.editor,
      })
    }
    return [
      inputRule,
    ]
  },
})