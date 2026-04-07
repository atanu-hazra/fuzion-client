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
                    'rewind',
                    'fast-forward',
                    'progress',
                    'current-time',
                    'duration',
                    'mute',
                    'volume',
                    'settings',
                    'pip',
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
                resetOnEnd: false,
                ratio: '16:9',
            });

            // Autoplay: try unmuted first, fall back to muted if browser blocks it
            playerRef.current.once('ready', () => {
                const playPromise = playerRef.current?.play();
                if (playPromise !== undefined) {
                    playPromise.catch(() => {
                        // Browser blocked autoplay — try muted
                        if (playerRef.current) {
                            playerRef.current.muted = true;
                            playerRef.current.play().catch(() => { });
                        }
                    });
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
