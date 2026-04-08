"use client";
import React, { useEffect, useRef } from 'react';

interface VideoPlayerProps {
    src: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ src }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const playerRef = useRef<any>(null);

    useEffect(() => {
        if (!videoRef.current) return;

        let destroyed = false;

        import('plyr').then(({ default: Plyr }) => {
            if (destroyed || !videoRef.current) return;

            playerRef.current = new Plyr(videoRef.current, {
                controls: [
                    'play-large',
                    'play',
                    'current-time',
                    'progress',
                    'duration',
                    'settings',
                    'fullscreen',
                ],
                settings: ['speed', 'loop'],
                speed: {
                    selected: 1,
                    options: [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2],
                },
                keyboard: { focused: true, global: false },
                tooltips: { controls: true, seek: true },
                autoplay: true,
                muted: false,
                volume: 1,
                resetOnEnd: false,
                ratio: '16:9',
            });

            playerRef.current.once('ready', () => {
                if (playerRef.current) {
                    playerRef.current.volume = 1;
                    playerRef.current.muted = false;
                }

                const playPromise = playerRef.current?.play();
                if (playPromise !== undefined) {
                    playPromise.catch(() => {
                        if (playerRef.current) {
                            playerRef.current.muted = true;
                            playerRef.current.play().catch(() => { });
                        }
                    });
                }
            });

            // Prevent any external or programmatic volume/mute changes
            playerRef.current.on('volumechange', () => {
                if (!playerRef.current) return;
                if (playerRef.current.muted) {
                    playerRef.current.muted = false;
                }
                if (playerRef.current.volume !== 1) {
                    playerRef.current.volume = 1;
                }
            });
        });

        return () => {
            destroyed = true;
            if (playerRef.current) {
                try { playerRef.current.destroy(); } catch (_) { }
                playerRef.current = null;
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [src]);

    return (
        <div className="fuzion-plyr w-full">
            {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
            <video
                ref={videoRef}
                src={src}
                playsInline
                style={{ width: '100%', display: 'block' }}
            />
        </div>
    );
};

export default VideoPlayer;