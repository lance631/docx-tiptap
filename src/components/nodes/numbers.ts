import { Editor, Extension, Mark, mergeAttributes } from "@tiptap/core";
import type { EditorState } from 'prosemirror-state';
import type { Transaction } from 'prosemirror-state';

let h1Counter = 1; 
let h2Counter = 1; 
let h3Counter = 1; 
let h4Counter = 1; 

const getChineseNumber = (num) => {
    const chineseNumbers = ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十'];
  const chineseUnits = ['', '十', '百', '千'];
  const chineseBigUnits = ['', '万', '亿'];

  if (num <= 10) {
    return chineseNumbers[num - 1];
  } else if (num < 20) {
    return `十${chineseNumbers[num - 11]}`;
  } else {
    const numStr = num.toString();
    const digitCount = numStr.length;
    let result = '';

    for (let i = 0; i < digitCount; i++) {
      const digit = parseInt(numStr[i]);
      const unitIndex = digitCount - i - 1;

      if (digit !== 0) {
        if (digit !== 1 || unitIndex !== 1) {
          result += chineseNumbers[digit - 1];
        }
        result += chineseUnits[unitIndex];
      }

      if (unitIndex % 4 === 0 && unitIndex > 0) {
        result += chineseBigUnits[unitIndex / 4];
      }
    }

    return result;
  }
  };

declare module '@tiptap/core' {
    interface Commands<ReturnType>{
       toggleTitleNumber: ( editor: Editor, tr: Transaction, state: EditorState ) => ReturnType
    }
}


export const titleNumberMark = Mark.create({
    name: "titleNumber",
    addAttributes () {
      return {
        type: {
          default: null,
          parseHTML: (el) =>  (el as HTMLSpanElement).getAttribute('data-type'),
          renderHTML: (attrs) =>{
            console.log('titleNumber', attrs)
            return { 
              'data-type':attrs.type
            }
          },
        },
      }
    },
    parseHTML() {
      return [
        {
          tag: "span[data-type]",
          getAttrs: (el) => !!(el as HTMLSpanElement).getAttribute('data-review')?.trim() && null,
        },
      ];
    },
  
    renderHTML({ HTMLAttributes }) {
      return ["span", mergeAttributes(this.options.HTMLAttributes, HTMLAttributes),0];
    },
  });

export const numbersExtension = Extension.create({
    name: 'numbers',

    addExtensions() {
        return [titleNumberMark];
      },

    addOptions(){
        return {
            HTMLAttributes: {},
        }
    },

    addCommands(){
        return {
            toggleTitleNumber: () => ({ editor, state }) =>{
                 const { tr, doc } = state;
                 const applyNumbering = (pos,node) => {
                    const Hnode = doc.nodeAt(pos)
                    const numberText = `${h1Counter++}、`;
                    let newTr = tr;
                    const hasTitleNumber = node.content.content.some(
                        (item) => item.marks.some((mark) => mark.type.name === 'titleNumber')
                      );
                      console.log('hasTitleNumberMark::::',hasTitleNumber)
                      if(hasTitleNumber){
                        node.content.descendants((childNode, childPos) => {
                            if(childNode.marks.some((mark) => mark.type.name === 'titleNumber')
                            ){
                                console.log("childNode childPos::::::::::::::::::::::::",pos,childNode,childNode.nodeSize,childPos)      
                                newTr = newTr.delete(tr.mapping.map(pos+childPos),tr.mapping.map(pos + childPos + childNode.nodeSize+1));
   
                            }
                        })
                      }else{
                        const numberingNode = editor.state.schema.text(numberText, [editor.state.schema.mark('titleNumber',{type: 'title-number'})]);
                        newTr = newTr.insert(tr.mapping.map(pos+1), numberingNode);
                      }
                   return newTr
                  };

                  const applyNumberingDel = (pos,node) => {
                    let newTr = tr;
                    const hasTitleNumber = node.content.content.some(
                        (item) => item.marks.some((mark) => mark.type.name === 'titleNumber')
                      );
                      console.log('hasTitleNumberMark::::',hasTitleNumber)
                      if(hasTitleNumber){
                        node.content.descendants((childNode, childPos) => {
                            if(childNode.marks.some((mark) => mark.type.name === 'titleNumber')
                            ){
                                console.log("childNode childPos::::::::::::::::::::::::",pos,childNode,childNode.nodeSize,childPos)      
                                newTr = newTr.delete(tr.mapping.map(pos+childPos),tr.mapping.map(pos + childPos + childNode.nodeSize+1));
   
                            }
                        })
                      }
                   return newTr
                  }


                  const applyNumberingAdd = (pos,node,level) => {
                    const Hnode = doc.nodeAt(pos)
                    let numberText = '·'
                    if(level == 1){
                         numberText = `${getChineseNumber(h1Counter++)}、`;
                         h2Counter = 1
                         h3Counter = 1
                         h4Counter = 1
                    }else if(level == 2){
                         numberText = `（${getChineseNumber(h2Counter++)}）`;
                         h3Counter = 1
                         h4Counter = 1
                    }else if(level == 3){
                        numberText = `${h3Counter++}.`;
                        h4Counter = 1
                    }else if(level == 4){
                    numberText = `（${h4Counter++}）`;
                    }else if(level == 5){
                        }
                    let newTr = tr;
                        const numberingNode = editor.state.schema.text(numberText, [editor.state.schema.mark('titleNumber',{type: 'title-number'})]);
                        newTr = newTr.insert(tr.mapping.map(pos+1), numberingNode);
                   return newTr
                  };

                  const updatedTr = doc.descendants((node, pos) => {
                    if(document.querySelector('span[data-type="title-number"]')){
                        applyNumberingDel(pos,node);
                    }else{
                        if (node.type.name === 'heading' && node.attrs.level === 1) {
                        applyNumberingAdd(pos,node,1);
                        }else if(node.type.name === 'heading' && node.attrs.level === 2){
                        applyNumberingAdd(pos,node,2);
                        }else if(node.type.name === 'heading' && node.attrs.level === 3){
                        applyNumberingAdd(pos,node,3);
                        }else if(node.type.name === 'heading' && node.attrs.level === 4){
                        applyNumberingAdd(pos,node,4);
                        }else if(node.type.name === 'heading' && node.attrs.level === 5){
                        applyNumberingAdd(pos,node,5);
                        }
                    }
                 });
                 if(updatedTr){
                    editor.view.dispatch(tr);
                 }

                h1Counter = 1;
                return true
            }
        }
    }


})
