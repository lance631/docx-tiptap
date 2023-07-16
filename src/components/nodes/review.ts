import type { Command, EditorState } from "prosemirror-state";
import type { Step } from "prosemirror-transform";
import type { Node } from "prosemirror-model";
import { Slice } from "prosemirror-model";
import { ReplaceStep } from "prosemirror-transform";
import { Editor, Extension, Mark, mergeAttributes, getMarkRange } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { TextSelection } from 'prosemirror-state';

declare module "prosemirror-transform" { 
  interface ReplaceStep {
    structure: boolean;
  }
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    review: {
      setReviewMode: () => ReturnType;
      unsetReviewMode: () => ReturnType;
      setManageCenterMode: () => ReturnType;
      unsetManageCenterMode: () => ReturnType;
    };
  }
}

interface ReviewOptions {
  enable: boolean;
}

export const ReviewInsertionMark = Mark.create({
  name: "reviewInsertion",
  addOptions(){
    return{
      HTMLAttributes: {},
      isPreview:Boolean,
    }
  },
  addAttributes () {
    return {
      review: {
        default: null,
        parseHTML: (el) =>  (el as HTMLSpanElement).getAttribute('data-review'),
        renderHTML: (attrs) =>{
          console.log('reviewInsertion', attrs)
          return { 
            'data-review': JSON.stringify(attrs.review )
          }
        },
      },
    }
  },
  parseHTML() {
    return [
      {
        tag: "ins[data-review]",
        getAttrs: (el) => !!(el as HTMLSpanElement).getAttribute('data-review')?.trim() && null,
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ["ins", mergeAttributes(this.options.HTMLAttributes, HTMLAttributes),0];
  },
});

export const ReviewDeletionMark = Mark.create({
  
  name: "reviewDeletion",
  parseHTML() {
    return [
      {
        tag: "del",
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ["del", 0];
  },
});

export const Review = Extension.create<ReviewOptions>({
  name: "review",
  // onTransaction({ transaction }) {
  //   if (transaction.docChanged) {
  //     console.log("ontr", transaction);
  //     const step = transaction.steps[0];
  //     const inverted = step.invert(transaction.docs[0]);
  //     // this.editor.state.apply()
  //     this.editor.state.applyTransaction(transaction)
  //     // this.editor.commands.undo()
  //     // this.editor.state.apply()
  //     // transaction.
  //     //   thi
  //   }
  // },
  //
  // onUpdate() {
  //   // console.log("onUpdate",this);
  // },
  addExtensions() {
    return [ReviewDeletionMark, ReviewInsertionMark];
  },
  addOptions() {
    return {
      enable: false,
    };
  },
  addCommands() {
    return {
      setReviewMode:
        () =>
        ({ commands, editor, state }) => {
          return setReviewModeEnable(state, true);
        },
      unsetReviewMode:
        () =>
        ({ commands, state }) => {
          return setReviewModeEnable(state, false);
        },
      setManageCenterMode:
        () =>
        ({ commands, editor, state }) => {
          return setManageCenterModeEnable(state, true);
        },
      unsetManageCenterMode:
        () =>
        ({ commands, state }) => {
          return setManageCenterModeEnable(state, false);
        },
    };
  },
  addProseMirrorPlugins() {
    return [ReviewPlugin(this.options)];
  },
});

let ManageCenterModeEnable = true;
const setManageCenterModeEnable = (state: EditorState, value: boolean) => {
  ManageCenterModeEnable = value
  
};

const reviewKey = new PluginKey<ReviewState>("review");
const setReviewModeEnable = (state: EditorState, value: boolean) => {
  const st = reviewKey.getState(state);
  if (!st) return false;
  st.enable = value;
  return true;
};
interface manageCenterState {
  enable: boolean;
}
interface ReviewState {
  enable: boolean;
}

export const ReviewPlugin = (options: ReviewOptions) => {
  return new Plugin<ReviewState>({
    key: reviewKey,
    filterTransaction(tr, state) {
      // console.log('filterTransaction:::',state)
    //   // if (state.)
    //   if (!tr.docChanged) {
    //     return true;
    //   }
    //
    //   const pluginState = reviewKey.getState(state);
    //   if (!(pluginState && pluginState.enable)) {
    //     return true;
    //   }
    //   console.log(tr.getMeta("reviewTr"))
    //   if (tr.getMeta("reviewTr")) {
    //     return true;
    //   }
    //
    //   const step = tr.steps[0];
    //   const originalStepTr = state.tr;
    //   originalStepTr.step(step);
    //   originalStepTr.setMeta("reviewTr", true);
    //   console.log(originalStepTr)
    //   state = state.apply(originalStepTr);
    //
    //   return false;
    //   // if (st && st.enable) {
    //   //   if (tr.docChanged) {
    //   //     console.log(tr);
    //   //     const step = tr.steps[0];
    //   //
    //   //     const handleStep = (step: Step, doc: Node) => {
    //   //       const originalStepTr = state.tr;
    //   //       originalStepTr.step(step);
    //   //       state.applyTransaction(originalStepTr);
    //   //       const trackTr = state.tr;
    //   //       // if (step instanceof ReplaceStep) {
    //   //       //   console.log(step)
    //   //       //   if (step.slice.size > 0) {
    //   //       //     const insertionMark = state.doc.type.schema.marks.reviewInsertion.create();
    //   //       //     // const deletionMark = state.doc.type.schema.marks.reviewDeletion.create();
    //   //       //     const { from } = step;
    //   //       //     const to = from + step.slice.size;
    //   //       //     trackTr.addMark(from, to, insertionMark);
    //   //       //     // remove the deletion mark to avoid the default del style
    //   //       //     // trackTr.removeMark(from, to, deletionMark);
    //   //       //   }
    //   //       //
    //   //       //
    //   //       //   // if (step.from !== step.to) {
    //   //       //   //   const invertedStep = step.invert(doc);
    //   //       //   //   /**
    //   //       //   //    * if the chars is has 'insert' mark, then just ignore the delete action
    //   //       //   //    * so we need to recognize the insert mark in invertedStep's slice
    //   //       //   //    */
    //   //       //   //   console.log('invertedStep', invertedStep);
    //   //       //   //   /**
    //   //       //   //    * a step includes multiple content, how can I found the insertion mark to skip?
    //   //       //   //    * we can scan the step content and gen a new step with Slice.empty to delete them
    //   //       //   //    */
    //   //       //   //   const deleteSteps:ReplaceStep[] = []
    //   //       //   //   let offset = 0
    //   //       //   //   invertedStep.slice.content.forEach(content => {
    //   //       //   //     const start = invertedStep.from + offset
    //   //       //   //     const end = start + content.nodeSize
    //   //       //   //     offset += content.nodeSize
    //   //       //   //     if (content.marks.find(m => m.type.name === 'insertion')) {
    //   //       //   //       deleteSteps.push(new ReplaceStep(start, end, Slice.empty))
    //   //       //   //     }
    //   //       //   //   })
    //   //       //   //   const deleteStep = new ReplaceStep(
    //   //       //   //     invertedStep.from,
    //   //       //   //     invertedStep.from,
    //   //       //   //     invertedStep.slice,
    //   //       //   //     invertedStep.structure
    //   //       //   //   );
    //   //       //   //   // readd the deleted content
    //   //       //   //   trackTr.step(deleteStep);
    //   //       //   //
    //   //       //   //   const { from } = deleteStep;
    //   //       //   //   const to = from + deleteStep.slice.size;
    //   //       //   //   // add delete mark on the reAdded content
    //   //       //   //   const deletionMark = state.doc.type.schema.marks.deletion.create();
    //   //       //   //   trackTr.addMark(from, to, deletionMark);
    //   //       //   //   deleteSteps.forEach(step => {
    //   //       //   //     // delete the content if it is already with insertion mark
    //   //       //   //     trackTr.step(step)
    //   //       //   //   })
    //   //       //   // }
    //   //       //   state = state.apply(trackTr);
    //   //       // }
    //   //     };
    //   //     tr.steps.forEach((step, index) => {
    //   //       handleStep(step, tr.docs[index]);
    //   //     });
    //   //
    //   //     return false;
    //   //   }
    //   // }
       return true;
     },
    appendTransaction(transactions, oldState, newState) {
      const pluginState = reviewKey.getState(newState);
      // console.log('pluginState:::',pluginState?.enable)
      if(!ManageCenterModeEnable){
        const _step = transactions[0].steps[0];
        if (!(_step instanceof ReplaceStep)) return null;
        const { from, to } = _step;
        console.log('!ManageCenterModeEnable::::::',oldState.doc.slice(from, to))

      }
      if (!(pluginState && pluginState.enable)) {
        return null;
      }

      const tr = newState.tr;
      const oldTransaction = transactions[0];
      if (!oldTransaction) return null;
      // if (!oldTransaction.docChanged) return null;
      const insertionMark =
        newState.doc.type.schema.marks.reviewInsertion.create({review:{user:'zhangsan',time:Date.now()}});
      const deletionMark =
        newState.doc.type.schema.marks.reviewDeletion.create({user:'zhangsan',time:Date.now()});
      const step = oldTransaction.steps[0];

      if (!(step instanceof ReplaceStep)) return null;
      // console.log('step:::',transactions,step)
      if (step.slice.size) {
        const { from } = step;
        const to = from + step.slice.size;
        

        const { doc } = newState;

          const $pos = doc.resolve(from);
          const range = getMarkRange(doc.resolve(from), newState.schema.marks.reviewInsertion)

          //const range = getMarkRange($pos, newState.doc.type.schema.marks.reviewInsertion);
          console.log('Range::::::', from, range);
        
        // const { schema, doc, tr } = newState
        // const range = getMarkRange(doc.resolve(from), schema.marks.reviewInsertion)
        // console.log('range:::',range)
        tr.addMark(range?range.from:from, range?range.to:to, insertionMark);
        // remove the deletion mark to avoid the default del style
        tr.removeMark(from, to, deletionMark);
      }
      if (step.from !== step.to) {
        // console.log(step)
        const invertedStep = step.invert(oldTransaction.docs[0]);
        let offset = 0;
        const deleteSteps: ReplaceStep[] = [];
        invertedStep.slice.content.forEach((content) => {
          // console.log(content);
          const start = invertedStep.from + offset;
          const end = start + content.nodeSize;
          offset += content.nodeSize;
          if (content.marks.find((m) => m.type.name === "reviewInsertion")) {
            deleteSteps.push(new ReplaceStep(start, end, Slice.empty));
          }
        });
        // console.log(invertedStep);
        const deleteStep = new ReplaceStep(
          invertedStep.from,
          invertedStep.from,
          invertedStep.slice,
          invertedStep.structure
        );

        tr.step(deleteStep);

        const { from } = deleteStep;
        const to = from + deleteStep.slice.size;
        // add delete mark on the reAdded content
        const deletionMark = newState.doc.type.schema.marks.reviewDeletion.create({user:'zhangsan',time:Date.now()});
        console.log('deletionMark:::', 1)
        tr.addMark(from, to, deletionMark);
        const selectionFrom = from > 0 ? from - 1 : from;
        // const cursorPos = tr.selection.$head.pos;
        // const newCursorPos = cursorPos - 1
        //view.chain().focus().setTextSelection(newCursorPos).run()
        //let newSelection = tr.doc.resolve(newCursorPos)
        // tr.setSelection(newSelection,newSelection)
        //console.log('deletionMark:::', 2, cursorPos)
        //const newSelection = tr.selection.constructor.near(tr.doc.resolve(newCursorPos));
        //tr.setSelection(newCursorPos);
        const newSelection = TextSelection.between(tr.doc.resolve(selectionFrom+1), tr.doc.resolve(selectionFrom));
        const selectedText = tr.doc.textBetween(newSelection.from, newSelection.to)

        console.log('selectionFrom:::',selectedText)

        tr.setSelection(newSelection);
        deleteSteps.forEach((step) => {
          console.log('deletionMark:::', 3)
          // delete the content if it is already with insertion mark
          tr.step(step);
        });
      }
      return tr;
    },
    state: {
      init() {
        return {
          enable: options.enable,
        };
      },
      apply(tr, prev) {
        return prev;
      },
    },
  });
};
