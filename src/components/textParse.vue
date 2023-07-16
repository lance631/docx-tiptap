<template>
      <div class="parse">
        <h3>      
            Text Parse:::
        </h3>
        <div class="content">{{ msg }}</div>
        <img :src="imgSrc" />
        <div class="input_word">
            <input class="hide" type="file" id="wordFile" @change="getWordFile" accept=".docx" />
            <label for="wordFile" class="editor-export cur-p c-hover">{{ loading ? '转换中，请稍后' : '导入word' }}</label>
        </div>
        <div class="html-content" v-html="htmlContent"></div>

        <div>

        </div>

    </div>
</template>
<script setup lang="ts">
import { onMounted ,ref} from 'vue';
import { textParse } from '@package/main'
import mammoth from "mammoth";

defineProps<{
  msg: string
}>()
const imgSrc = ref('');
const htmlContent = ref('')
const loading = ref(false);

function getWordFile(e: Event) {
  if (e.target instanceof HTMLInputElement && e.target.files) {
    const file = e.target.files[0];

    const reader = new FileReader();
    reader.onload = async function (evt) {
      if (evt.target instanceof FileReader && evt.target.result) {
        const arrayBuffer = evt.target.result as ArrayBuffer;

        loading.value = true;

        try {
          const result = await mammoth.extractRawText({ arrayBuffer });
          const text = result.value.trim();
          // 处理从 Word 导入的文本内容
          console.log('导入的文本内容:', text);
         // 处理从 Word 导入的文本内容
          const htmlResult = await mammoth.convertToHtml({ arrayBuffer });
          htmlContent.value = htmlResult.value;

          // 在这里执行进一步的操作，例如将文本内容插入到富文本编辑器中


        } catch (error) {
          console.error('导入文档时出现错误:', error);
        }

        loading.value = false;
      }
    };

    reader.onerror = function () {
      console.error('无法读取文档文件');
    };

    reader.readAsArrayBuffer(file);
  }
}

// 添加 getBlobContent 方法
function getBlobContent(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve(reader.result as string);
    };
    reader.onerror = reject;
    reader.readAsText(blob);
  });
}

onMounted(() =>{
    console.log(textParse)
    document.addEventListener('paste',async function(event){
         //var promise = await navigator.clipboard.read()
         //console.log('promise:::',promise)
        const clipboardData = event.clipboardData
        //获取剪贴板中的文本
        //let text = clipboardData?.getData('text/plain')
        //获取剪贴板中的富文本格式
        const html = await clipboardData?.getData('text/html')
        console.log('html:::',html)
        //const image = await clipboardData?.getData('image/png')

        // First, ask the Permissions API if we have some kind of access to
// the "clipboard-read" feature.

navigator.permissions.query({name: "clipboard-read"}).then(result => {
  // If permission to read the clipboard is granted or if the user will
  // be prompted to allow it, we proceed.
  const getImageDataPromises = [];

  if (result.state == "granted" || result.state == "prompt") {
    navigator.clipboard.read().then(clipboardItems => {
       console.log("clipboardItems:::",clipboardItems)

       for (const clipboardItem of clipboardItems) {
        for (const type of clipboardItem.types) {
                if (type === 'text/plain') {
                    clipboardItem.getType(type).then(text => {
                    const blob = new Blob([text], { type: 'text/plain' });
                    const textContent =  blob.text();
                    console.log('纯文本内容01:', text);
                    console.log('纯文本内容02:', textContent);

                    }).catch(error => {
                    console.error('无法获取纯文本内容:', error);
                    });
                } else if (type === 'text/html') {
                    clipboardItem.getType(type).then(html => {
                    //console.log('HTML 内容01:', html);
                    const blob = new Blob([html], { type: 'text/html' });
                   const htmlContent =  getBlobContent(html);
                   htmlContent.then(htmlContent => {
                        console.log('HTML 内容01:', htmlContent);
                    }).catch(error => {
                        console.error('无法获取 HTML 内容:', error);
                    });
                   const textContent =  blob.text();
                   console.log('HTML 内容02:', htmlContent);
                    console.log('HTML 内容03:', textContent);
                    }).catch(error => {
                    console.error('无法获取 HTML 内容:', error);
                    });
                } else if (type === 'image/png') {
                    const imgDataPromise = clipboardItem.getType(type).then(imageData => {
                    const blob = new Blob([imageData], { type: 'image/png' });
                    const file = new File([imageData], 'image.png', { type: 'image/png' });

                    const imgContent =  blob.text();

                    console.log('图像数据01:', imageData);
                    console.log('图像数据02:', imgContent);
                    console.log('图像数据03:',file)
                    const objectURL = URL.createObjectURL(file);

                    imgSrc.value = objectURL;

                    }).catch(error => {
                    console.error('无法获取图像数据:', error);
                    });
                }
            }
        }

    });
  }



});

    })
})


</script>
<style scoped>
.parse h3 {
    font-size: 1.2rem;
}
.parse .content{
    font-size: 1rem;
}
.input_word{
    background: #fffcd9;
}
</style>