import { EventEmitter } from 'events';

class AudioManager extends EventEmitter {
  private audioContext: AudioContext | null = null;
  private mediaStream: MediaStream | null = null;
  private audioInput: MediaStreamAudioSourceNode | null = null;
  private audioOutput: AudioDestinationNode | null = null;
  private gainNode: GainNode | null = null;
  private isInitialized = false;

  constructor() {
    super();
    this.setupAudioContext = this.setupAudioContext.bind(this);
    this.startAudioInput = this.startAudioInput.bind(this);
    this.stopAudioInput = this.stopAudioInput.bind(this);
    this.playAudio = this.playAudio.bind(this);
  }

  private async setupAudioContext(): Promise<void> {
    if (this.isInitialized) return;

    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.audioOutput = this.audioContext.destination;
      this.gainNode = this.audioContext.createGain();
      this.gainNode.connect(this.audioOutput);
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize audio context:', error);
      throw error;
    }
  }

  public async startAudioInput(): Promise<void> {
    try {
      await this.setupAudioContext();

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 48000,
          channelCount: 2
        }
      });

      this.mediaStream = stream;
      this.audioInput = this.audioContext!.createMediaStreamSource(stream);
      this.audioInput.connect(this.gainNode!);
      this.emit('inputStarted');
    } catch (error) {
      console.error('Failed to start audio input:', error);
      throw error;
    }
  }

  public stopAudioInput(): void {
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }

    if (this.audioInput) {
      this.audioInput.disconnect();
      this.audioInput = null;
    }

    this.emit('inputStopped');
  }

  public async playAudio(audioData: ArrayBuffer): Promise<void> {
    try {
      await this.setupAudioContext();

      const audioBuffer = await this.audioContext!.decodeAudioData(audioData);
      const source = this.audioContext!.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(this.gainNode!);

      source.onended = () => {
        this.emit('playbackEnded');
      };

      source.start(0);
      this.emit('playbackStarted');
    } catch (error) {
      console.error('Failed to play audio:', error);
      throw error;
    }
  }

  public setVolume(value: number): void {
    if (this.gainNode) {
      this.gainNode.gain.value = Math.max(0, Math.min(1, value));
    }
  }

  public cleanup(): void {
    this.stopAudioInput();
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    this.isInitialized = false;
  }
}

export const audioManager = new AudioManager();