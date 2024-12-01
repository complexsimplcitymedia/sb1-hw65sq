import React from 'react';
import { Helmet } from 'react-helmet-async';
import PixelStreamViewer from './PixelStreamViewer';

export default function FAQAIPage() {
  return (
    <div className="min-h-screen pt-32 pb-24">
      <Helmet>
        <title>Interactive AI Experience | Kustom Auto Wrx</title>
        <meta name="description" content="Experience our interactive AI assistant for real-time auto customization guidance. Get expert advice on vehicle modifications, wraps, and paint services." />
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            Interactive Vehicle Customization Experience
          </h1>
          <p className="text-xl text-gray-300">
            Customize your vehicle in real-time with our AI assistant
          </p>
        </div>

        <div className="aspect-w-16 w-full relative bg-black rounded-xl overflow-hidden">
          <div className="absolute inset-0">
            <PixelStreamViewer streamUrl="https://share.streampixel.io/674ace125b329980e86ba9e5" />
          </div>
        </div>

        <div className="mt-8 flex items-center justify-center space-x-12">
          <a
            href="https://www.unrealengine.com/en-US"
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center group"
          >
            <img
              src="https://cdn2.steamgriddb.com/logo/598fb37d8e3a1f127b3ba7700febc92e.png"
              alt="Powered by Unreal Engine"
              className="h-16 w-auto object-contain mb-2 transition-opacity group-hover:opacity-80"
              style={{ filter: 'brightness(0) invert(1)' }}
            />
            <span className="text-gray-400 text-sm group-hover:text-white transition-colors">
              Powered by Unreal Engine
            </span>
          </a>

          <a
            href="https://convai.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center group"
          >
            <img
              src="https://pbs.twimg.com/profile_images/1630613772405559296/cDfl82Lp_400x400.jpg"
              alt="Powered by Convai"
              className="h-16 w-16 object-contain rounded-full mb-2 transition-opacity group-hover:opacity-80"
            />
            <span className="text-gray-400 text-sm group-hover:text-white transition-colors">
              Powered by Convai
            </span>
          </a>
        </div>

        <div className="mt-8 text-center text-gray-400">
          <p>Press 'T' to talk while focused on the window. The AI assistant will help guide you through vehicle customization options.</p>
        </div>
      </div>
    </div>
  );
}