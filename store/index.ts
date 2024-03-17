import { defineStore } from 'pinia'
import { SCENE, AUDIO } from '~/utils/constents';


interface State {
    url: string;
    msg: string | null;
    networkconnections: boolean;
    mode: SCENE;
    audioSettings: AUDIO;
    camGranted: boolean;
    micGranted: boolean;
    blobs: any[];
    videos: HTMLVideoElement[];
    finished: boolean;
    camerror: boolean;
    camIsReady: boolean;
    screenIsReady: boolean;
    currentResolution: number;
    resolutions: { height: number; width: number; aspectRatio: { ideal: number }; frameRate: number }[];
    readyToStart: number;

}

export const useMainStore = defineStore('mainStore', {
    state: (): State => ({
        url: 'http://localhost:8000',
        msg: null,
        networkconnections: true,
        mode: SCENE.SCREEN_AND_WEBCAM,
        audioSettings: AUDIO.MIC_AND_SYSTEM,
        camGranted: false,
        micGranted: false,
        blobs: [],
        videos: [],
        finished: false,
        camerror: false,
        camIsReady: false,
        screenIsReady: false,
        currentResolution: 1080,
        resolutions: [
            { height: 1080, width: 1920, aspectRatio: { ideal: 1.7777777778 }, frameRate: 30 },
            { height: 720, width: 1280, aspectRatio: { ideal: 1.7777777778 }, frameRate: 30 },
            { height: 480, width: 720, aspectRatio: { ideal: 1.7777777778 }, frameRate: 30 }
        ],
        readyToStart: 0 // Assuming an initial value of 0
    }),

    actions: {
        changeMode(mode: SCENE): void {
            this.mode = mode
            if (mode === SCENE.WEBCAM_ONLY) {
                this.audioSettings = AUDIO.MIC
            }
        },

        recSettings(mode: AUDIO): void {
            this.audioSettings = mode
        },

        newBlob(blob: any): void {
            this.blobs.push(blob)
        },

        setFinished(val: boolean): void {
            this.finished = val
        },

        setCamError(val: boolean): void {
            this.camerror = val
        },

        setCamReady(val: boolean): void {
            this.camIsReady = val
        },

        setScreenReady(val: boolean): void {
            this.screenIsReady = val
        },

        setCamGranted(val: boolean): void {
            this.camGranted = val
        },

        setMicGranted(val: boolean): void {
            this.micGranted = val
        },

        reRecord(): void {
            this.camerror = false
            this.finished = false
            this.camIsReady = false
            this.screenIsReady = false
            this.blobs = []
            this.mode = SCENE.SCREEN_AND_WEBCAM
            this.audioSettings = AUDIO.MIC_AND_SYSTEM
            this.currentResolution = 1080
        },

        changeResolution(newResolution: number): void {
            this.currentResolution = newResolution
        },
        incrementReadyToStart(): void {
            this.readyToStart += 1
        },
        async checkConnection() {
            await fetch('http://info.cern.ch')
            this.networkconnections = !this.networkconnections
        }
    }
})