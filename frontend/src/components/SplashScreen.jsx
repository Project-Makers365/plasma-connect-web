import { useEffect, useState } from 'react';
import { FaTint } from 'react-icons/fa';

function SplashScreen({ onComplete }) {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Start fade out after 2.5 seconds
    const fadeTimer = setTimeout(() => {
      setFadeOut(true);
    }, 2500);

    // Complete after animation finishes
    const completeTimer = setTimeout(() => {
      onComplete();
    }, 3200);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-red-600 via-red-700 to-red-800 transition-opacity duration-700 ${
        fadeOut ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <div className="text-center">
        {/* Animated Icon */}
        <div className="mb-6 flex justify-center">
          <div
            className={`flex h-24 w-24 items-center justify-center rounded-full bg-white shadow-2xl ${
              fadeOut ? 'scale-0' : 'scale-100'
            } transition-transform duration-500`}
            style={{
              animation: fadeOut ? 'none' : 'pulse 1.5s ease-in-out infinite',
            }}
          >
            <FaTint className="h-12 w-12 text-red-600" />
          </div>
        </div>

        {/* Animated Text */}
        <h1
          className={`text-4xl font-extrabold tracking-wider text-white sm:text-5xl lg:text-6xl ${
            fadeOut ? 'translate-y-4 opacity-0' : 'translate-y-0 opacity-100'
          } transition-all duration-500`}
        >
          <span
            className="inline-block"
            style={{
              animation: fadeOut ? 'none' : 'fadeInUp 0.8s ease-out forwards',
            }}
          >
            PLASMA
          </span>{' '}
          <span
            className="inline-block"
            style={{
              animation: fadeOut ? 'none' : 'fadeInUp 0.8s ease-out 0.2s forwards',
              opacity: 0,
            }}
          >
            DONOR
          </span>
        </h1>
        {/*<h2*/}
        {/*  className={`mt-2 text-3xl font-bold tracking-widest text-red-200 sm:text-4xl lg:text-5xl ${*/}
        {/*    fadeOut ? 'translate-y-4 opacity-0' : 'translate-y-0 opacity-100'*/}
        {/*  } transition-all duration-500 delay-100`}*/}
        {/*  style={{*/}
        {/*    animation: fadeOut ? 'none' : 'fadeInUp 0.8s ease-out 0.4s forwards',*/}
        {/*    opacity: 0,*/}
        {/*  }}*/}
        {/*>*/}
        {/*  WEBSITE*/}
        {/*</h2>*/}

        {/* Loading Bar */}
        <div className="mx-auto mt-8 h-1 w-48 overflow-hidden rounded-full bg-red-400/30">
          <div
            className="h-full rounded-full bg-white"
            style={{
              animation: 'loading 2s ease-in-out forwards',
            }}
          />
        </div>

        {/* Tagline */}
        <p
          className="mt-6 text-sm font-medium tracking-wide text-red-200"
          style={{
            animation: fadeOut ? 'none' : 'fadeIn 1s ease-out 0.8s forwards',
            opacity: 0,
          }}
        >
          Saving Lives, One Drop at a Time
        </p>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
            box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.4);
          }
          50% {
            transform: scale(1.05);
            box-shadow: 0 0 0 20px rgba(255, 255, 255, 0);
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes loading {
          0% {
            width: 0%;
          }
          50% {
            width: 60%;
          }
          100% {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}

export default SplashScreen;
