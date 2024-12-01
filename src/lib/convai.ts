import { ConvaiClient } from 'convai-web-sdk';

class ConvaiService {
  private static instance: ConvaiService;
  private client: ConvaiClient;
  private isInitialized = false;

  private constructor() {
    this.client = new ConvaiClient({
      apiKey: 'f0539882a720271f351f3fb7a65d7ab3',
      characterId: '12f40b7c-7c90-11ef-af26-42010a7be011',
      enableAudio: true,
      enableText: false,
      forceSecure: true,
      languageCode: 'en-US',
      textOnlyResponse: false,
      micUsage: true,
      enableFacialData: false,
      faceModel: 3,
      audioConfig: {
        sampleRate: 48000,
        channelCount: 2,
        secure: true
      }
    });
  }

  public static getInstance(): ConvaiService {
    if (!ConvaiService.instance) {
      ConvaiService.instance = new ConvaiService();
    }
    return ConvaiService.instance;
  }

  public async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      if (window.location.protocol !== 'https:') {
        throw new Error('Voice functionality requires a secure HTTPS connection');
      }

      await this.client.initialize();
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize Convai service:', error);
      throw error;
    }
  }

  public async startSession(): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }
    await this.client.startSession();
  }

  public async startAudioInput(): Promise<void> {
    await this.client.startAudioChunk();
  }

  public async stopAudioInput(): Promise<void> {
    await this.client.endAudioChunk();
  }

  public async sendTextMessage(text: string): Promise<void> {
    await this.client.sendTextMessage(text);
  }

  public onResponse(callback: (response: any) => void): void {
    this.client.onResponse(callback);
  }

  public onError(callback: (error: any) => void): void {
    this.client.onError(callback);
  }

  public onAudioPlay(callback: () => void): void {
    this.client.onAudioPlay(callback);
  }

  public onAudioStop(callback: () => void): void {
    this.client.onAudioStop(callback);
  }

  public async resetSession(): Promise<void> {
    await this.client.resetSession();
    this.isInitialized = false;
  }

  public cleanup(): void {
    this.client.cleanup();
    this.isInitialized = false;
  }
}

export const convaiService = ConvaiService.getInstance();