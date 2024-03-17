import { ref, onMounted, onBeforeUnmount } from "vue";
import { fetchFile, createFFmpeg } from '@ffmpeg/ffmpeg'
const ffmpeg = createFFmpeg({ log: true });

export function useThumbnails(file: string) {
  const thumbnails = ref([])




  async function convert() {
    ffmpeg.FS('writeFile', `${file}.mp4`, await fetchFile(file));

    await ffmpeg.run('-i', `${file}.mp4`, '-t', '2.5', '-ss', '2.0', '-f', 'gif', 'out.gif');
    const data = ffmpeg.FS('readFile', 'out.gif');
    const url = URL.createObjectURL(new Blob([data.buffer], { type: 'video/mp4' }))

    // gif = url
  }
  onMounted(() => {
    convert()

  });



  return {
    thumbnails,
  };
}