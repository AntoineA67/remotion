import {
	usePlayingState,
	useTimelinePosition,
	useVideoConfig,
} from '@remotion/core';
import React, {useCallback, useEffect} from 'react';
import {Pause} from '../icons/pause';
import {Play} from '../icons/play';

const lastFrames: number[] = [];

export const PlayPause: React.FC = () => {
	const [playing, setPlaying] = usePlayingState();
	const [frame, setFrame] = useTimelinePosition();
	const config = useVideoConfig();

	const toggle = useCallback(() => {
		if (!config) {
			return null;
		}
		setPlaying((p) => !p);
	}, [config, setPlaying]);

	const onKeyPress = useCallback(
		(e: KeyboardEvent) => {
			if (e.code === 'Space') {
				toggle();
				e.preventDefault();
			}
		},
		[toggle]
	);

	useEffect(() => {
		window.addEventListener('keypress', onKeyPress);
		return (): void => {
			window.removeEventListener('keypress', onKeyPress);
		};
	}, [onKeyPress]);

	useEffect(() => {
		if (!config) {
			return;
		}
		if (playing) {
			lastFrames.push(Date.now());
			const last10Frames = lastFrames.slice().reverse().slice(0, 10).reverse();
			const timesBetweenFrames: number[] = last10Frames
				.map((f, i) => {
					if (i === 0) {
						return null;
					}
					return f - last10Frames[i - 1];
				})
				.filter((t) => t !== null) as number[];
			const averageTimeBetweenFrames =
				timesBetweenFrames.reduce((a, b) => {
					return a + b;
				}, 0) / timesBetweenFrames.length;
			const expectedTime = 1000 / config.fps;
			const slowerThanExpected = averageTimeBetweenFrames - expectedTime;
			const timeout =
				last10Frames.length === 0
					? expectedTime
					: expectedTime - slowerThanExpected;
			const t = setTimeout(() => {
				setFrame((currFrame) => {
					const nextFrame = currFrame + 1;
					// TODO: Could be timing unsafe
					if (nextFrame >= config.durationInFrames) {
						return 0;
					}
					return currFrame + 1;
				});
			}, timeout);
			return () => {
				clearTimeout(t);
			};
		}
	}, [config, frame, playing, setFrame]);

	return (
		<div
			onClick={toggle}
			style={{display: 'inline-flex', opacity: config ? 1 : 0.5}}
		>
			{playing ? (
				<Pause
					style={{
						height: 14,
						width: 14,
						color: 'white',
					}}
				/>
			) : (
				<Play
					style={{
						height: 14,
						width: 14,
						color: 'white',
					}}
				/>
			)}
		</div>
	);
};
