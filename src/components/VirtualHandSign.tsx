import React, { useState } from 'react';
import {
  Hand,
  RotateCw,
  Eye,
  Sparkles,
  Layers,
  ArrowRight,
  Maximize2
} from 'lucide-react';

export type HandTheme = 'contrast' | 'natural' | 'bronze' | 'cyber';
export type HandOrientation = 'right' | 'left';
export type HandPerspective = 'front' | 'angled' | 'profile';

interface VirtualHandSignProps {
  letter: string;
  className?: string;
  interactive?: boolean;
  showControls?: boolean;
  compact?: boolean;
  onLetterChange?: (nextLetter: string) => void;
}

// Finger joint configuration interface
interface HandPoseConfig {
  name: string;
  category: string;
  palmRotation: number; // degrees
  scaleY?: number;
  flipX?: boolean;
  wristAngle?: number;
  thumb: {
    state: 'upright' | 'tucked_front' | 'tucked_under' | 'spread' | 'touch_index' | 'touch_all' | 'touch_pinky' | 'horizontal' | 'down';
    x: number;
    y: number;
    tipX: number;
    tipY: number;
    angle: number;
    curl: number; // 0 to 1
  };
  index: {
    state: 'straight' | 'curled' | 'hook' | 'tucked' | 'crossed' | 'touch_thumb' | 'horizontal' | 'down' | 'spread';
    angle: number;
    length: number;
    curl: number;
  };
  middle: {
    state: 'straight' | 'curled' | 'hook' | 'angled_forward' | 'tucked' | 'crossed' | 'touch_thumb' | 'spread';
    angle: number;
    length: number;
    curl: number;
  };
  ring: {
    state: 'straight' | 'curled' | 'hook' | 'tucked' | 'touch_thumb' | 'spread';
    angle: number;
    length: number;
    curl: number;
  };
  pinky: {
    state: 'straight' | 'curled' | 'hook' | 'spread' | 'touch_thumb';
    angle: number;
    length: number;
    curl: number;
  };
  hasMotion?: 'j_swoop' | 'z_zigzag';
  visualHint: string;
}

// Detailed parametric ASL pose model for each character
const ASL_POSES: Record<string, HandPoseConfig> = {
  A: {
    name: 'Fist with Side Thumb',
    category: 'Fist Sign',
    palmRotation: 0,
    visualHint: 'Closed fist with thumb upright alongside the index finger',
    thumb: { state: 'upright', x: 108, y: 220, tipX: 110, tipY: 155, angle: -10, curl: 0.1 },
    index: { state: 'curled', angle: -2, length: 50, curl: 0.95 },
    middle: { state: 'curled', angle: 0, length: 50, curl: 0.95 },
    ring: { state: 'curled', angle: 2, length: 48, curl: 0.95 },
    pinky: { state: 'curled', angle: 5, length: 45, curl: 0.95 },
  },
  B: {
    name: 'Flat Four Fingers',
    category: 'Open Sign',
    palmRotation: 0,
    visualHint: 'Four fingers straight up pressed together; thumb folded flat across palm',
    thumb: { state: 'tucked_front', x: 108, y: 225, tipX: 155, tipY: 215, angle: 45, curl: 0.7 },
    index: { state: 'straight', angle: 0, length: 90, curl: 0.02 },
    middle: { state: 'straight', angle: 0, length: 98, curl: 0.02 },
    ring: { state: 'straight', angle: 0, length: 92, curl: 0.02 },
    pinky: { state: 'straight', angle: 0, length: 80, curl: 0.02 },
  },
  C: {
    name: 'Curved C Profile',
    category: 'Arched Sign',
    palmRotation: 18,
    visualHint: 'Fingers and thumb curved into a smooth semicircular "C"',
    thumb: { state: 'spread', x: 115, y: 235, tipX: 175, tipY: 240, angle: 30, curl: 0.45 },
    index: { state: 'hook', angle: 25, length: 70, curl: 0.6 },
    middle: { state: 'hook', angle: 22, length: 74, curl: 0.6 },
    ring: { state: 'hook', angle: 20, length: 70, curl: 0.6 },
    pinky: { state: 'hook', angle: 18, length: 64, curl: 0.6 },
  },
  D: {
    name: 'Index Point Up',
    category: 'Pointer Sign',
    palmRotation: 5,
    visualHint: 'Index finger pointing straight up; thumb touches curled middle finger',
    thumb: { state: 'touch_index', x: 108, y: 220, tipX: 150, tipY: 195, angle: 35, curl: 0.65 },
    index: { state: 'straight', angle: 0, length: 92, curl: 0.02 },
    middle: { state: 'curled', angle: 5, length: 48, curl: 0.9 },
    ring: { state: 'curled', angle: 8, length: 46, curl: 0.9 },
    pinky: { state: 'curled', angle: 10, length: 42, curl: 0.9 },
  },
  E: {
    name: 'Curled Claw Knuckles',
    category: 'Compact Sign',
    palmRotation: 0,
    visualHint: 'All fingertips bent sharply downward resting on top of thumb',
    thumb: { state: 'tucked_under', x: 108, y: 225, tipX: 160, tipY: 215, angle: 45, curl: 0.8 },
    index: { state: 'curled', angle: -2, length: 42, curl: 0.88 },
    middle: { state: 'curled', angle: 0, length: 44, curl: 0.88 },
    ring: { state: 'curled', angle: 2, length: 42, curl: 0.88 },
    pinky: { state: 'curled', angle: 4, length: 38, curl: 0.88 },
  },
  F: {
    name: 'OK Circle & Spread',
    category: 'Circle Sign',
    palmRotation: 0,
    visualHint: 'Index and thumb tips form an "O" circle; middle, ring, pinky straight and spread',
    thumb: { state: 'touch_index', x: 108, y: 220, tipX: 138, tipY: 175, angle: 30, curl: 0.55 },
    index: { state: 'touch_thumb', angle: 15, length: 65, curl: 0.7 },
    middle: { state: 'spread', angle: 5, length: 96, curl: 0.02 },
    ring: { state: 'spread', angle: 15, length: 90, curl: 0.02 },
    pinky: { state: 'spread', angle: 25, length: 80, curl: 0.02 },
  },
  G: {
    name: 'Horizontal Pinch',
    category: 'Parallel Sign',
    palmRotation: -75,
    visualHint: 'Index finger and thumb pointing sideways parallel with small gap',
    thumb: { state: 'horizontal', x: 108, y: 220, tipX: 195, tipY: 200, angle: 80, curl: 0.05 },
    index: { state: 'horizontal', angle: 82, length: 85, curl: 0.05 },
    middle: { state: 'curled', angle: 0, length: 46, curl: 0.95 },
    ring: { state: 'curled', angle: 0, length: 44, curl: 0.95 },
    pinky: { state: 'curled', angle: 0, length: 40, curl: 0.95 },
  },
  H: {
    name: 'Dual Horizontal Fingers',
    category: 'Parallel Sign',
    palmRotation: -75,
    visualHint: 'Index and middle fingers extended together pointing horizontally to side',
    thumb: { state: 'tucked_front', x: 108, y: 220, tipX: 150, tipY: 215, angle: 45, curl: 0.8 },
    index: { state: 'horizontal', angle: 82, length: 88, curl: 0.05 },
    middle: { state: 'straight', angle: 82, length: 88, curl: 0.05 },
    ring: { state: 'curled', angle: 0, length: 44, curl: 0.95 },
    pinky: { state: 'curled', angle: 0, length: 40, curl: 0.95 },
  },
  I: {
    name: 'Pinky Upright',
    category: 'Fist Sign',
    palmRotation: 0,
    visualHint: 'Pinky finger pointing straight up; thumb wraps over curled fingers',
    thumb: { state: 'tucked_front', x: 108, y: 220, tipX: 155, tipY: 195, angle: 45, curl: 0.8 },
    index: { state: 'curled', angle: -2, length: 48, curl: 0.95 },
    middle: { state: 'curled', angle: 0, length: 48, curl: 0.95 },
    ring: { state: 'curled', angle: 2, length: 46, curl: 0.95 },
    pinky: { state: 'straight', angle: 5, length: 82, curl: 0.02 },
  },
  J: {
    name: 'Pinky J-Trace Motion',
    category: 'Motion Sign',
    palmRotation: 0,
    hasMotion: 'j_swoop',
    visualHint: 'Pinky finger up tracing a curved "J" stroke in the air with wrist turn',
    thumb: { state: 'tucked_front', x: 108, y: 220, tipX: 155, tipY: 195, angle: 45, curl: 0.8 },
    index: { state: 'curled', angle: -2, length: 48, curl: 0.95 },
    middle: { state: 'curled', angle: 0, length: 48, curl: 0.95 },
    ring: { state: 'curled', angle: 2, length: 46, curl: 0.95 },
    pinky: { state: 'straight', angle: 8, length: 82, curl: 0.02 },
  },
  K: {
    name: 'V-Hand with Thumb Support',
    category: 'V Sign',
    palmRotation: 0,
    visualHint: 'Index finger up, middle finger forward, thumb resting at middle knuckle',
    thumb: { state: 'upright', x: 108, y: 220, tipX: 135, tipY: 175, angle: 15, curl: 0.2 },
    index: { state: 'straight', angle: -8, length: 90, curl: 0.02 },
    middle: { state: 'angled_forward', angle: 20, length: 82, curl: 0.25 },
    ring: { state: 'curled', angle: 5, length: 45, curl: 0.95 },
    pinky: { state: 'curled', angle: 8, length: 42, curl: 0.95 },
  },
  L: {
    name: 'Classic L-Shape',
    category: 'Angular Sign',
    palmRotation: 0,
    visualHint: 'Index finger straight up and thumb extended at 90° forming clear "L"',
    thumb: { state: 'spread', x: 108, y: 220, tipX: 62, tipY: 215, angle: -80, curl: 0.02 },
    index: { state: 'straight', angle: 0, length: 92, curl: 0.02 },
    middle: { state: 'curled', angle: 0, length: 48, curl: 0.95 },
    ring: { state: 'curled', angle: 3, length: 45, curl: 0.95 },
    pinky: { state: 'curled', angle: 6, length: 42, curl: 0.95 },
  },
  M: {
    name: 'Three Fingers over Thumb',
    category: 'Tuck Sign',
    palmRotation: 0,
    visualHint: 'Thumb tucked under first three fingers; pinky folded in palm',
    thumb: { state: 'tucked_under', x: 108, y: 220, tipX: 180, tipY: 205, angle: 50, curl: 0.8 },
    index: { state: 'tucked', angle: -2, length: 50, curl: 0.9 },
    middle: { state: 'tucked', angle: 0, length: 52, curl: 0.9 },
    ring: { state: 'tucked', angle: 2, length: 50, curl: 0.9 },
    pinky: { state: 'curled', angle: 8, length: 40, curl: 0.95 },
  },
  N: {
    name: 'Two Fingers over Thumb',
    category: 'Tuck Sign',
    palmRotation: 0,
    visualHint: 'Thumb tucked under first two fingers (index & middle); ring & pinky in palm',
    thumb: { state: 'tucked_under', x: 108, y: 220, tipX: 160, tipY: 205, angle: 45, curl: 0.8 },
    index: { state: 'tucked', angle: -2, length: 50, curl: 0.9 },
    middle: { state: 'tucked', angle: 0, length: 52, curl: 0.9 },
    ring: { state: 'curled', angle: 5, length: 45, curl: 0.95 },
    pinky: { state: 'curled', angle: 8, length: 40, curl: 0.95 },
  },
  O: {
    name: 'Full O-Ring',
    category: 'Ring Sign',
    palmRotation: 15,
    visualHint: 'All fingertips meet the thumb tip forming a circular "O"',
    thumb: { state: 'touch_all', x: 108, y: 220, tipX: 155, tipY: 190, angle: 35, curl: 0.6 },
    index: { state: 'hook', angle: 25, length: 65, curl: 0.75 },
    middle: { state: 'hook', angle: 20, length: 68, curl: 0.75 },
    ring: { state: 'hook', angle: 15, length: 65, curl: 0.75 },
    pinky: { state: 'hook', angle: 10, length: 58, curl: 0.75 },
  },
  P: {
    name: 'Downward K Pose',
    category: 'Inverted Sign',
    palmRotation: 105,
    visualHint: 'Inverted K: index finger pointing downward, middle forward, thumb propped',
    thumb: { state: 'spread', x: 108, y: 220, tipX: 135, tipY: 245, angle: 30, curl: 0.2 },
    index: { state: 'down', angle: 175, length: 85, curl: 0.05 },
    middle: { state: 'angled_forward', angle: 140, length: 75, curl: 0.3 },
    ring: { state: 'curled', angle: 0, length: 45, curl: 0.95 },
    pinky: { state: 'curled', angle: 0, length: 40, curl: 0.95 },
  },
  Q: {
    name: 'Downward Pinch',
    category: 'Inverted Sign',
    palmRotation: 95,
    visualHint: 'Letter G directed straight down toward the ground',
    thumb: { state: 'down', x: 108, y: 220, tipX: 165, tipY: 275, angle: 165, curl: 0.1 },
    index: { state: 'down', angle: 175, length: 80, curl: 0.05 },
    middle: { state: 'curled', angle: 0, length: 45, curl: 0.95 },
    ring: { state: 'curled', angle: 0, length: 42, curl: 0.95 },
    pinky: { state: 'curled', angle: 0, length: 38, curl: 0.95 },
  },
  R: {
    name: 'Crossed Fingers',
    category: 'Crossed Sign',
    palmRotation: 0,
    visualHint: 'Index and middle fingers crossed tightly over each other (for luck)',
    thumb: { state: 'tucked_front', x: 108, y: 220, tipX: 155, tipY: 195, angle: 45, curl: 0.8 },
    index: { state: 'crossed', angle: 10, length: 90, curl: 0.02 },
    middle: { state: 'crossed', angle: -8, length: 94, curl: 0.02 },
    ring: { state: 'curled', angle: 5, length: 45, curl: 0.95 },
    pinky: { state: 'curled', angle: 8, length: 40, curl: 0.95 },
  },
  S: {
    name: 'Front Fist Wrapped',
    category: 'Fist Sign',
    palmRotation: 0,
    visualHint: 'Tight closed fist with thumb wrapped across front of all knuckles',
    thumb: { state: 'tucked_front', x: 108, y: 220, tipX: 180, tipY: 185, angle: 55, curl: 0.65 },
    index: { state: 'curled', angle: -2, length: 48, curl: 0.95 },
    middle: { state: 'curled', angle: 0, length: 48, curl: 0.95 },
    ring: { state: 'curled', angle: 2, length: 46, curl: 0.95 },
    pinky: { state: 'curled', angle: 5, length: 42, curl: 0.95 },
  },
  T: {
    name: 'Thumb in Knuckle Gap',
    category: 'Tuck Sign',
    palmRotation: 0,
    visualHint: 'Thumb tip tucked between the index and middle fingers',
    thumb: { state: 'tucked_front', x: 108, y: 220, tipX: 135, tipY: 175, angle: 40, curl: 0.7 },
    index: { state: 'curled', angle: -3, length: 50, curl: 0.9 },
    middle: { state: 'curled', angle: 0, length: 48, curl: 0.95 },
    ring: { state: 'curled', angle: 2, length: 46, curl: 0.95 },
    pinky: { state: 'curled', angle: 5, length: 42, curl: 0.95 },
  },
  U: {
    name: 'Two Fingers Together Up',
    category: 'Double Sign',
    palmRotation: 0,
    visualHint: 'Index and middle fingers held straight up pressed tightly together',
    thumb: { state: 'tucked_front', x: 108, y: 220, tipX: 155, tipY: 195, angle: 45, curl: 0.8 },
    index: { state: 'straight', angle: 0, length: 90, curl: 0.02 },
    middle: { state: 'straight', angle: 0, length: 96, curl: 0.02 },
    ring: { state: 'curled', angle: 5, length: 45, curl: 0.95 },
    pinky: { state: 'curled', angle: 8, length: 40, curl: 0.95 },
  },
  V: {
    name: 'Peace / V-Spread',
    category: 'Spread Sign',
    palmRotation: 0,
    visualHint: 'Index and middle fingers spread apart forming an open "V" victory sign',
    thumb: { state: 'tucked_front', x: 108, y: 220, tipX: 155, tipY: 195, angle: 45, curl: 0.8 },
    index: { state: 'spread', angle: -15, length: 90, curl: 0.02 },
    middle: { state: 'spread', angle: 15, length: 96, curl: 0.02 },
    ring: { state: 'curled', angle: 5, length: 45, curl: 0.95 },
    pinky: { state: 'curled', angle: 8, length: 40, curl: 0.95 },
  },
  W: {
    name: 'Three Fingers Spread',
    category: 'Spread Sign',
    palmRotation: 0,
    visualHint: 'Index, middle, and ring fingers spread open like a "W"; thumb holds pinky',
    thumb: { state: 'touch_pinky', x: 108, y: 220, tipX: 185, tipY: 200, angle: 55, curl: 0.75 },
    index: { state: 'spread', angle: -18, length: 88, curl: 0.02 },
    middle: { state: 'spread', angle: 0, length: 96, curl: 0.02 },
    ring: { state: 'spread', angle: 18, length: 90, curl: 0.02 },
    pinky: { state: 'curled', angle: 10, length: 38, curl: 0.95 },
  },
  X: {
    name: 'Index Hook / Crook',
    category: 'Hook Sign',
    palmRotation: 0,
    visualHint: 'Index finger curled into a distinct hook/crook; other fingers closed',
    thumb: { state: 'tucked_front', x: 108, y: 220, tipX: 150, tipY: 195, angle: 45, curl: 0.8 },
    index: { state: 'hook', angle: -2, length: 65, curl: 0.7 },
    middle: { state: 'curled', angle: 0, length: 48, curl: 0.95 },
    ring: { state: 'curled', angle: 2, length: 46, curl: 0.95 },
    pinky: { state: 'curled', angle: 5, length: 42, curl: 0.95 },
  },
  Y: {
    name: 'Thumb & Pinky (Shaka)',
    category: 'Wide Sign',
    palmRotation: 0,
    visualHint: 'Thumb and pinky extended wide; middle three fingers tucked into palm',
    thumb: { state: 'spread', x: 108, y: 220, tipX: 55, tipY: 205, angle: -85, curl: 0.02 },
    index: { state: 'curled', angle: -2, length: 46, curl: 0.95 },
    middle: { state: 'curled', angle: 0, length: 46, curl: 0.95 },
    ring: { state: 'curled', angle: 2, length: 44, curl: 0.95 },
    pinky: { state: 'spread', angle: 35, length: 82, curl: 0.02 },
  },
  Z: {
    name: 'Zigzag Trace in Air',
    category: 'Motion Sign',
    palmRotation: 0,
    hasMotion: 'z_zigzag',
    visualHint: 'Index finger traces a dynamic "Z" zigzag in the air with crisp strokes',
    thumb: { state: 'tucked_front', x: 108, y: 220, tipX: 155, tipY: 195, angle: 45, curl: 0.8 },
    index: { state: 'straight', angle: 0, length: 90, curl: 0.02 },
    middle: { state: 'curled', angle: 2, length: 48, curl: 0.95 },
    ring: { state: 'curled', angle: 4, length: 46, curl: 0.95 },
    pinky: { state: 'curled', angle: 6, length: 42, curl: 0.95 },
  },
  // Digits 0-9
  '0': {
    name: 'Zero Oval Ring',
    category: 'Number Sign',
    palmRotation: 15,
    visualHint: 'O-ring with all fingertips meeting thumb tip',
    thumb: { state: 'touch_all', x: 108, y: 220, tipX: 155, tipY: 190, angle: 35, curl: 0.6 },
    index: { state: 'hook', angle: 25, length: 65, curl: 0.75 },
    middle: { state: 'hook', angle: 20, length: 68, curl: 0.75 },
    ring: { state: 'hook', angle: 15, length: 65, curl: 0.75 },
    pinky: { state: 'hook', angle: 10, length: 58, curl: 0.75 },
  },
  '1': {
    name: 'Number One',
    category: 'Number Sign',
    palmRotation: 0,
    visualHint: 'Single index finger pointing straight up',
    thumb: { state: 'tucked_front', x: 108, y: 220, tipX: 155, tipY: 195, angle: 45, curl: 0.8 },
    index: { state: 'straight', angle: 0, length: 92, curl: 0.02 },
    middle: { state: 'curled', angle: 2, length: 48, curl: 0.95 },
    ring: { state: 'curled', angle: 4, length: 46, curl: 0.95 },
    pinky: { state: 'curled', angle: 6, length: 42, curl: 0.95 },
  },
  '2': {
    name: 'Number Two',
    category: 'Number Sign',
    palmRotation: 0,
    visualHint: 'Index and middle fingers extended up in V shape',
    thumb: { state: 'tucked_front', x: 108, y: 220, tipX: 155, tipY: 195, angle: 45, curl: 0.8 },
    index: { state: 'spread', angle: -12, length: 90, curl: 0.02 },
    middle: { state: 'spread', angle: 12, length: 96, curl: 0.02 },
    ring: { state: 'curled', angle: 5, length: 45, curl: 0.95 },
    pinky: { state: 'curled', angle: 8, length: 40, curl: 0.95 },
  },
  '3': {
    name: 'Number Three (Thumb + 2)',
    category: 'Number Sign',
    palmRotation: 0,
    visualHint: 'Thumb, index, and middle fingers up; ring and pinky curled',
    thumb: { state: 'spread', x: 108, y: 220, tipX: 62, tipY: 215, angle: -80, curl: 0.02 },
    index: { state: 'straight', angle: -10, length: 90, curl: 0.02 },
    middle: { state: 'straight', angle: 10, length: 96, curl: 0.02 },
    ring: { state: 'curled', angle: 5, length: 45, curl: 0.95 },
    pinky: { state: 'curled', angle: 8, length: 40, curl: 0.95 },
  },
  '4': {
    name: 'Number Four',
    category: 'Number Sign',
    palmRotation: 0,
    visualHint: 'Four fingers up, thumb folded flat across palm',
    thumb: { state: 'tucked_front', x: 108, y: 225, tipX: 155, tipY: 215, angle: 45, curl: 0.7 },
    index: { state: 'spread', angle: -12, length: 88, curl: 0.02 },
    middle: { state: 'spread', angle: -4, length: 96, curl: 0.02 },
    ring: { state: 'spread', angle: 4, length: 90, curl: 0.02 },
    pinky: { state: 'spread', angle: 12, length: 80, curl: 0.02 },
  },
  '5': {
    name: 'Number Five',
    category: 'Number Sign',
    palmRotation: 0,
    visualHint: 'All five fingers spread wide open',
    thumb: { state: 'spread', x: 108, y: 220, tipX: 55, tipY: 205, angle: -80, curl: 0.02 },
    index: { state: 'spread', angle: -20, length: 88, curl: 0.02 },
    middle: { state: 'spread', angle: -5, length: 98, curl: 0.02 },
    ring: { state: 'spread', angle: 10, length: 92, curl: 0.02 },
    pinky: { state: 'spread', angle: 25, length: 82, curl: 0.02 },
  },
  '6': {
    name: 'Number Six (Pinky Touch)',
    category: 'Number Sign',
    palmRotation: 0,
    visualHint: 'Thumb tip touches pinky tip; index, middle, ring fingers extended up',
    thumb: { state: 'touch_pinky', x: 108, y: 220, tipX: 185, tipY: 200, angle: 55, curl: 0.75 },
    index: { state: 'spread', angle: -12, length: 90, curl: 0.02 },
    middle: { state: 'spread', angle: 0, length: 96, curl: 0.02 },
    ring: { state: 'spread', angle: 12, length: 90, curl: 0.02 },
    pinky: { state: 'touch_thumb', angle: 15, length: 60, curl: 0.7 },
  },
  '7': {
    name: 'Number Seven (Ring Touch)',
    category: 'Number Sign',
    palmRotation: 0,
    visualHint: 'Thumb tip touches ring finger tip; index, middle, pinky extended up',
    thumb: { state: 'touch_all', x: 108, y: 220, tipX: 165, tipY: 195, angle: 45, curl: 0.7 },
    index: { state: 'spread', angle: -15, length: 90, curl: 0.02 },
    middle: { state: 'spread', angle: -2, length: 96, curl: 0.02 },
    ring: { state: 'touch_thumb', angle: 10, length: 60, curl: 0.75 },
    pinky: { state: 'spread', angle: 22, length: 82, curl: 0.02 },
  },
  '8': {
    name: 'Number Eight (Middle Touch)',
    category: 'Number Sign',
    palmRotation: 0,
    visualHint: 'Thumb tip touches middle finger tip; index, ring, pinky extended up',
    thumb: { state: 'touch_all', x: 108, y: 220, tipX: 145, tipY: 190, angle: 35, curl: 0.7 },
    index: { state: 'spread', angle: -18, length: 90, curl: 0.02 },
    middle: { state: 'touch_thumb', angle: 0, length: 62, curl: 0.75 },
    ring: { state: 'spread', angle: 12, length: 92, curl: 0.02 },
    pinky: { state: 'spread', angle: 25, length: 82, curl: 0.02 },
  },
  '9': {
    name: 'Number Nine (Index Touch)',
    category: 'Number Sign',
    palmRotation: 0,
    visualHint: 'Thumb tip touches index finger tip; middle, ring, pinky extended up',
    thumb: { state: 'touch_index', x: 108, y: 220, tipX: 135, tipY: 180, angle: 30, curl: 0.6 },
    index: { state: 'touch_thumb', angle: 10, length: 60, curl: 0.75 },
    middle: { state: 'spread', angle: 0, length: 96, curl: 0.02 },
    ring: { state: 'spread', angle: 15, length: 90, curl: 0.02 },
    pinky: { state: 'spread', angle: 28, length: 80, curl: 0.02 },
  },
};

export const VirtualHandSign: React.FC<VirtualHandSignProps> = ({
  letter,
  className = '',
  interactive = true,
  showControls = true,
  compact = false,
  onLetterChange,
}) => {
  const [orientation, setOrientation] = useState<HandOrientation>('right');
  const [theme, setTheme] = useState<HandTheme>('contrast');
  const [showSkeleton, setShowSkeleton] = useState<boolean>(true);
  const [activePerspective, setActivePerspective] = useState<HandPerspective>('front');

  const charUpper = (letter || 'A').toUpperCase().charAt(0) || 'A';
  const pose = ASL_POSES[charUpper] || ASL_POSES['A'];

  // Color pallet mappings for themes
  const themeStyles = {
    contrast: {
      bg: 'bg-slate-950',
      border: 'border-cyan-500/40',
      palmFill: 'url(#palm-contrast-grad)',
      fingerFill: 'url(#finger-contrast-grad)',
      fingerStroke: '#22d3ee',
      fingerStrokeWidth: 3,
      creaseStroke: '#38bdf8',
      jointFill: '#f43f5e',
      jointRing: '#fda4af',
      boneStroke: '#06b6d4',
      badgeBg: 'bg-cyan-950/80 text-cyan-200 border-cyan-700/60',
      accentText: 'text-cyan-400',
    },
    natural: {
      bg: 'bg-amber-950/20',
      border: 'border-amber-300/40',
      palmFill: 'url(#palm-natural-grad)',
      fingerFill: 'url(#finger-natural-grad)',
      fingerStroke: '#ca8a04',
      fingerStrokeWidth: 2,
      creaseStroke: '#b45309',
      jointFill: '#e11d48',
      jointRing: '#fecdd3',
      boneStroke: '#ea580c',
      badgeBg: 'bg-amber-950/80 text-amber-200 border-amber-700/60',
      accentText: 'text-amber-500',
    },
    bronze: {
      bg: 'bg-stone-950',
      border: 'border-amber-700/50',
      palmFill: 'url(#palm-bronze-grad)',
      fingerFill: 'url(#finger-bronze-grad)',
      fingerStroke: '#78350f',
      fingerStrokeWidth: 2.5,
      creaseStroke: '#92400e',
      jointFill: '#fbbf24',
      jointRing: '#fef3c7',
      boneStroke: '#d97706',
      badgeBg: 'bg-amber-950/90 text-amber-100 border-amber-600',
      accentText: 'text-amber-400',
    },
    cyber: {
      bg: 'bg-slate-950',
      border: 'border-indigo-500/40',
      palmFill: 'url(#palm-cyber-grad)',
      fingerFill: 'url(#finger-cyber-grad)',
      fingerStroke: '#818cf8',
      fingerStrokeWidth: 2.5,
      creaseStroke: '#a5b4fc',
      jointFill: '#a855f7',
      jointRing: '#e9d5ff',
      boneStroke: '#6366f1',
      badgeBg: 'bg-indigo-950/80 text-indigo-200 border-indigo-700/60',
      accentText: 'text-indigo-400',
    },
  }[theme];

  // Helper to calculate phalanx joints for an extended or bent finger
  const getFingerJoints = (
    baseX: number,
    baseY: number,
    angleDeg: number,
    length: number,
    curl: number // 0 = straight up, 1 = curled into fist
  ) => {
    const rad = ((angleDeg - 90) * Math.PI) / 180;
    
    if (curl < 0.2) {
      // Straight finger
      const seg1 = length * 0.4;
      const seg2 = length * 0.35;
      const seg3 = length * 0.25;

      const p1X = baseX + Math.cos(rad) * seg1;
      const p1Y = baseY + Math.sin(rad) * seg1;

      const p2X = p1X + Math.cos(rad) * seg2;
      const p2Y = p1Y + Math.sin(rad) * seg2;

      const tipX = p2X + Math.cos(rad) * seg3;
      const tipY = p2Y + Math.sin(rad) * seg3;

      return { baseX, baseY, p1X, p1Y, p2X, p2Y, tipX, tipY, isCurled: false };
    } else if (curl < 0.8) {
      // Hook or semi-curled finger
      const bend1Rad = rad + 0.45;
      const bend2Rad = bend1Rad + 0.75;
      const seg1 = length * 0.45;
      const seg2 = length * 0.35;
      const seg3 = length * 0.3;

      const p1X = baseX + Math.cos(rad) * seg1;
      const p1Y = baseY + Math.sin(rad) * seg1;

      const p2X = p1X + Math.cos(bend1Rad) * seg2;
      const p2Y = p1Y + Math.sin(bend1Rad) * seg2;

      const tipX = p2X + Math.cos(bend2Rad) * seg3;
      const tipY = p2Y + Math.sin(bend2Rad) * seg3;

      return { baseX, baseY, p1X, p1Y, p2X, p2Y, tipX, tipY, isCurled: false, isHook: true };
    } else {
      // Fully curled in fist
      const seg = 18;
      const p1X = baseX + Math.cos(rad) * 16;
      const p1Y = baseY - 12;

      const p2X = p1X + 4;
      const p2Y = p1Y + 18;

      const tipX = baseX + 2;
      const tipY = baseY + 26;

      return { baseX, baseY, p1X, p1Y, p2X, p2Y, tipX, tipY, isCurled: true };
    }
  };

  // Base root knuckle coordinates on the palm
  const knucklePositions = {
    index: { x: 122, y: 175 },
    middle: { x: 154, y: 168 },
    ring: { x: 186, y: 172 },
    pinky: { x: 216, y: 184 },
  };

  const indexJoints = getFingerJoints(
    knucklePositions.index.x,
    knucklePositions.index.y,
    pose.index.angle,
    pose.index.length,
    pose.index.curl
  );

  const middleJoints = getFingerJoints(
    knucklePositions.middle.x,
    knucklePositions.middle.y,
    pose.middle.angle,
    pose.middle.length,
    pose.middle.curl
  );

  const ringJoints = getFingerJoints(
    knucklePositions.ring.x,
    knucklePositions.ring.y,
    pose.ring.angle,
    pose.ring.length,
    pose.ring.curl
  );

  const pinkyJoints = getFingerJoints(
    knucklePositions.pinky.x,
    knucklePositions.pinky.y,
    pose.pinky.angle,
    pose.pinky.length,
    pose.pinky.curl
  );

  // SVG render helper for finger path
  const renderFingerPath = (
    j: ReturnType<typeof getFingerJoints>,
    width: number,
    state: string
  ) => {
    if (j.isCurled) {
      // Curled knuckle pill
      return (
        <g className="transition-all duration-300">
          <ellipse
            cx={j.baseX}
            cy={j.baseY + 8}
            rx={width * 0.72}
            ry={14}
            fill={themeStyles.fingerFill}
            stroke={themeStyles.fingerStroke}
            strokeWidth={themeStyles.fingerStrokeWidth}
          />
          {/* Fold crease lines */}
          <line
            x1={j.baseX - width * 0.45}
            y1={j.baseY + 6}
            x2={j.baseX + width * 0.45}
            y2={j.baseY + 6}
            stroke={themeStyles.creaseStroke}
            strokeWidth={1.5}
            strokeLinecap="round"
          />
          <line
            x1={j.baseX - width * 0.35}
            y1={j.baseY + 14}
            x2={j.baseX + width * 0.35}
            y2={j.baseY + 14}
            stroke={themeStyles.creaseStroke}
            strokeWidth={1.2}
            strokeLinecap="round"
          />
        </g>
      );
    }

    // Extended or hooked finger path with rounded tip & joints
    const pathD = `
      M ${j.baseX - width / 2} ${j.baseY}
      Q ${j.p1X - width * 0.45} ${j.p1Y}, ${j.p2X - width * 0.4} ${j.p2Y}
      A ${width * 0.4} ${width * 0.4} 0 0 1 ${j.p2X + width * 0.4} ${j.p2Y}
      L ${j.p1X + width * 0.45} ${j.p1Y}
      L ${j.baseX + width / 2} ${j.baseY}
      Z
    `;

    return (
      <g className="transition-all duration-300">
        {/* Main finger body */}
        <path
          d={pathD}
          fill={themeStyles.fingerFill}
          stroke={themeStyles.fingerStroke}
          strokeWidth={themeStyles.fingerStrokeWidth}
          strokeLinejoin="round"
        />

        {/* Fingernail accent on extended fingers */}
        <ellipse
          cx={j.tipX}
          cy={j.tipY + 4}
          rx={width * 0.28}
          ry={width * 0.36}
          fill="#ffffff"
          opacity={0.3}
        />

        {/* Articulation joint creases */}
        <line
          x1={j.p1X - width * 0.3}
          y1={j.p1Y}
          x2={j.p1X + width * 0.3}
          y2={j.p1Y}
          stroke={themeStyles.creaseStroke}
          strokeWidth={1.5}
          strokeLinecap="round"
        />
        <line
          x1={j.p2X - width * 0.25}
          y1={j.p2Y}
          x2={j.p2X + width * 0.25}
          y2={j.p2Y}
          stroke={themeStyles.creaseStroke}
          strokeWidth={1.5}
          strokeLinecap="round"
        />
      </g>
    );
  };

  // Helper for Thumb rendering
  const renderThumb = () => {
    const t = pose.thumb;
    const baseThumbX = 100;
    const baseThumbY = 228;

    if (t.state === 'upright') {
      // Thumb resting upright beside index
      return (
        <g className="transition-all duration-300">
          <path
            d={`
              M ${baseThumbX - 12} ${baseThumbY + 20}
              C 80 200, 92 165, ${t.tipX} ${t.tipY}
              A 11 11 0 0 1 ${t.tipX + 16} ${t.tipY + 12}
              C 122 185, 126 215, ${baseThumbX + 18} ${baseThumbY + 20}
              Z
            `}
            fill={themeStyles.fingerFill}
            stroke={themeStyles.fingerStroke}
            strokeWidth={themeStyles.fingerStrokeWidth}
            strokeLinejoin="round"
          />
          {/* Thumb nail */}
          <ellipse
            cx={t.tipX + 8}
            cy={t.tipY + 6}
            rx={5}
            ry={7}
            fill="#ffffff"
            opacity={0.35}
          />
          {/* Thumb joint crease */}
          <line
            x1={98}
            y1={190}
            x2={116}
            y2={190}
            stroke={themeStyles.creaseStroke}
            strokeWidth={1.5}
            strokeLinecap="round"
          />
        </g>
      );
    } else if (t.state === 'spread') {
      // Extended wide (L, Y, 3, 5)
      return (
        <g className="transition-all duration-300">
          <path
            d={`
              M ${baseThumbX - 5} ${baseThumbY + 25}
              Q 75 220, ${t.tipX} ${t.tipY}
              A 11 11 0 0 1 ${t.tipX + 12} ${t.tipY - 14}
              Q 95 190, ${baseThumbX + 15} ${baseThumbY - 5}
              Z
            `}
            fill={themeStyles.fingerFill}
            stroke={themeStyles.fingerStroke}
            strokeWidth={themeStyles.fingerStrokeWidth}
            strokeLinejoin="round"
          />
          <ellipse
            cx={t.tipX + 4}
            cy={t.tipY - 6}
            rx={6}
            ry={5}
            fill="#ffffff"
            opacity={0.35}
          />
        </g>
      );
    } else if (t.state === 'horizontal' || t.state === 'down') {
      // G, H, P, Q
      return (
        <g className="transition-all duration-300">
          <path
            d={`
              M ${baseThumbX} ${baseThumbY + 20}
              Q 120 215, ${t.tipX} ${t.tipY}
              A 10 10 0 0 0 ${t.tipX} ${t.tipY - 18}
              Q 115 195, ${baseThumbX + 10} ${baseThumbY}
              Z
            `}
            fill={themeStyles.fingerFill}
            stroke={themeStyles.fingerStroke}
            strokeWidth={themeStyles.fingerStrokeWidth}
            strokeLinejoin="round"
          />
        </g>
      );
    } else {
      // Tucked across front or under knuckles (B, S, T, M, N, E, etc.)
      return (
        <g className="transition-all duration-300">
          <path
            d={`
              M ${baseThumbX - 6} ${baseThumbY + 15}
              Q 120 220, ${t.tipX} ${t.tipY}
              A 10 10 0 0 0 ${t.tipX - 4} ${t.tipY - 16}
              Q 110 195, ${baseThumbX + 8} ${baseThumbY}
              Z
            `}
            fill={themeStyles.fingerFill}
            stroke={themeStyles.fingerStroke}
            strokeWidth={themeStyles.fingerStrokeWidth}
            strokeLinejoin="round"
          />
          <line
            x1={118}
            y1={212}
            x2={142}
            y2={205}
            stroke={themeStyles.creaseStroke}
            strokeWidth={1.5}
            strokeLinecap="round"
          />
        </g>
      );
    }
  };

  // Flip transform for left hand
  const flipTransform = orientation === 'left' ? 'scale(-1, 1) translate(-320, 0)' : '';

  return (
    <div
      className={`rounded-3xl border ${themeStyles.border} ${themeStyles.bg} flex flex-col overflow-hidden relative shadow-xl transition-all ${className}`}
    >
      {/* Visual Canvas Header */}
      <div className="px-4 py-3 border-b border-slate-800/80 bg-slate-900/60 flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-purple-600/30 border border-purple-500/50 flex items-center justify-center text-purple-300 shadow-inner">
            <Hand className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black uppercase tracking-wider text-white">
                Virtual Hand Sign
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${themeStyles.badgeBg}`}>
                {charUpper}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 leading-tight">
              {pose.name} · {orientation === 'right' ? 'Right Hand' : 'Left Hand (Mirrored)'}
            </p>
          </div>
        </div>

        {/* Quick Orientation & Skeleton Action Toggles */}
        {showControls && (
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setOrientation((o) => (o === 'right' ? 'left' : 'right'))}
              title={`Switch to ${orientation === 'right' ? 'Left' : 'Right'} Hand`}
              className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-[11px] font-bold text-slate-200 border border-slate-700 flex items-center gap-1 transition-all"
            >
              <RotateCw className="w-3 h-3 text-cyan-400" />
              <span>{orientation === 'right' ? 'Right Hand' : 'Left Hand'}</span>
            </button>

            <button
              onClick={() => setShowSkeleton(!showSkeleton)}
              title="Toggle Finger Joint Skeletal Nodes"
              className={`p-1.5 rounded-xl border text-[11px] font-bold transition-all ${
                showSkeleton
                  ? 'bg-rose-950/80 border-rose-600 text-rose-300'
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
            </button>

            {/* Theme switcher */}
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value as HandTheme)}
              className="bg-slate-800 text-slate-300 text-[11px] font-bold rounded-xl px-2 py-1 border border-slate-700 focus:outline-none"
              title="Skin & Visual Theme"
            >
              <option value="contrast">High Contrast (A11y)</option>
              <option value="natural">Natural Skin</option>
              <option value="bronze">Deep Bronze</option>
              <option value="cyber">Cyber Assist</option>
            </select>
          </div>
        )}
      </div>

      {/* Main Virtual Hand Rendering Viewport */}
      <div className="relative flex-1 flex items-center justify-center p-3 sm:p-5 select-none min-h-[220px]">
        {/* Watermark character display behind hand */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5">
          <span className="text-[170px] font-black text-white font-mono">{charUpper}</span>
        </div>

        {/* Dynamic Motion Indicator for J and Z */}
        {pose.hasMotion && (
          <div className="absolute top-4 left-4 z-20 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/60 text-amber-300 text-[10px] font-extrabold flex items-center gap-1.5 animate-pulse">
            <Sparkles className="w-3 h-3" />
            <span>
              {pose.hasMotion === 'j_swoop'
                ? 'Dynamic: Swoop "J" curve in air'
                : 'Dynamic: Trace "Z" zigzag in air'}
            </span>
          </div>
        )}

        {/* SVG Virtual Hand */}
        <svg
          viewBox="0 0 320 340"
          className="w-full h-full max-h-[310px] drop-shadow-2xl transition-transform duration-300"
        >
          <defs>
            {/* Contrast Theme Gradients */}
            <linearGradient id="palm-contrast-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#083344" />
              <stop offset="100%" stopColor="#0e7490" />
            </linearGradient>
            <linearGradient id="finger-contrast-grad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#0891b2" />
            </linearGradient>

            {/* Natural Skin Gradients */}
            <linearGradient id="palm-natural-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fed7aa" />
              <stop offset="100%" stopColor="#fb923c" />
            </linearGradient>
            <linearGradient id="finger-natural-grad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#fed7aa" />
              <stop offset="100%" stopColor="#f97316" />
            </linearGradient>

            {/* Bronze Gradients */}
            <linearGradient id="palm-bronze-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#b45309" />
              <stop offset="100%" stopColor="#78350f" />
            </linearGradient>
            <linearGradient id="finger-bronze-grad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#d97706" />
              <stop offset="100%" stopColor="#92400e" />
            </linearGradient>

            {/* Cyber Gradients */}
            <linearGradient id="palm-cyber-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#312e81" />
              <stop offset="100%" stopColor="#4338ca" />
            </linearGradient>
            <linearGradient id="finger-cyber-grad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#818cf8" />
            </linearGradient>
          </defs>

          {/* Group with Hand Flip transform */}
          <g transform={flipTransform}>
            {/* WRIST AND FOREARM BASE */}
            <path
              d="
                M 125 338
                C 125 305, 120 280, 116 265
                L 218 265
                C 214 280, 209 305, 209 338
                Z
              "
              fill={themeStyles.palmFill}
              stroke={themeStyles.fingerStroke}
              strokeWidth={themeStyles.fingerStrokeWidth}
            />
            {/* Wrist crease */}
            <path
              d="M 122 278 C 145 285, 185 285, 212 278"
              fill="none"
              stroke={themeStyles.creaseStroke}
              strokeWidth={2}
              strokeLinecap="round"
            />

            {/* PALM BODY */}
            <path
              d="
                M 116 265
                C 95 240, 92 205, 110 182
                Q 120 174, 126 175
                Q 154 167, 160 168
                Q 186 170, 192 173
                Q 216 182, 222 185
                C 235 205, 232 245, 218 265
                Z
              "
              fill={themeStyles.palmFill}
              stroke={themeStyles.fingerStroke}
              strokeWidth={themeStyles.fingerStrokeWidth}
              strokeLinejoin="round"
            />

            {/* Palm lifelines and heart lines for realistic anatomical dimension */}
            <path
              d="M 120 205 Q 160 220, 205 198"
              fill="none"
              stroke={themeStyles.creaseStroke}
              strokeWidth={1.8}
              strokeLinecap="round"
              opacity={0.8}
            />
            <path
              d="M 124 220 Q 155 242, 175 260"
              fill="none"
              stroke={themeStyles.creaseStroke}
              strokeWidth={1.6}
              strokeLinecap="round"
              opacity={0.7}
            />

            {/* FINGERS RENDER (Render back to front) */}
            {/* Pinky */}
            {renderFingerPath(pinkyJoints, 16, pose.pinky.state)}

            {/* Ring */}
            {renderFingerPath(ringJoints, 18, pose.ring.state)}

            {/* Middle */}
            {renderFingerPath(middleJoints, 20, pose.middle.state)}

            {/* Index */}
            {renderFingerPath(indexJoints, 19, pose.index.state)}

            {/* Thumb (renders over knuckles when curled, or alongside) */}
            {renderThumb()}

            {/* BIOMETRIC SKELETAL OVERLAY (Essential for students with visual/cognitive disabilities) */}
            {showSkeleton && (
              <g className="transition-opacity duration-300">
                {/* Index Skeleton Chain */}
                <line
                  x1={indexJoints.baseX}
                  y1={indexJoints.baseY}
                  x2={indexJoints.p1X}
                  y2={indexJoints.p1Y}
                  stroke={themeStyles.boneStroke}
                  strokeWidth={2}
                  strokeDasharray="2,2"
                />
                <line
                  x1={indexJoints.p1X}
                  y1={indexJoints.p1Y}
                  x2={indexJoints.p2X}
                  y2={indexJoints.p2Y}
                  stroke={themeStyles.boneStroke}
                  strokeWidth={2}
                  strokeDasharray="2,2"
                />
                <line
                  x1={indexJoints.p2X}
                  y1={indexJoints.p2Y}
                  x2={indexJoints.tipX}
                  y2={indexJoints.tipY}
                  stroke={themeStyles.boneStroke}
                  strokeWidth={2}
                  strokeDasharray="2,2"
                />
                {/* Index Joint Nodes */}
                <circle cx={indexJoints.baseX} cy={indexJoints.baseY} r={3.5} fill={themeStyles.jointFill} />
                <circle cx={indexJoints.p1X} cy={indexJoints.p1Y} r={3.5} fill={themeStyles.jointFill} />
                <circle cx={indexJoints.p2X} cy={indexJoints.p2Y} r={3} fill={themeStyles.jointFill} />
                <circle cx={indexJoints.tipX} cy={indexJoints.tipY} r={4} fill={themeStyles.jointFill} stroke={themeStyles.jointRing} strokeWidth={1.5} />

                {/* Middle Skeleton Chain */}
                <line
                  x1={middleJoints.baseX}
                  y1={middleJoints.baseY}
                  x2={middleJoints.p1X}
                  y2={middleJoints.p1Y}
                  stroke={themeStyles.boneStroke}
                  strokeWidth={2}
                  strokeDasharray="2,2"
                />
                <line
                  x1={middleJoints.p1X}
                  y1={middleJoints.p1Y}
                  x2={middleJoints.p2X}
                  y2={middleJoints.p2Y}
                  stroke={themeStyles.boneStroke}
                  strokeWidth={2}
                  strokeDasharray="2,2"
                />
                <line
                  x1={middleJoints.p2X}
                  y1={middleJoints.p2Y}
                  x2={middleJoints.tipX}
                  y2={middleJoints.tipY}
                  stroke={themeStyles.boneStroke}
                  strokeWidth={2}
                  strokeDasharray="2,2"
                />
                {/* Middle Joint Nodes */}
                <circle cx={middleJoints.baseX} cy={middleJoints.baseY} r={3.5} fill={themeStyles.jointFill} />
                <circle cx={middleJoints.p1X} cy={middleJoints.p1Y} r={3.5} fill={themeStyles.jointFill} />
                <circle cx={middleJoints.p2X} cy={middleJoints.p2Y} r={3} fill={themeStyles.jointFill} />
                <circle cx={middleJoints.tipX} cy={middleJoints.tipY} r={4} fill={themeStyles.jointFill} stroke={themeStyles.jointRing} strokeWidth={1.5} />

                {/* Ring Skeleton Chain */}
                <line
                  x1={ringJoints.baseX}
                  y1={ringJoints.baseY}
                  x2={ringJoints.p1X}
                  y2={ringJoints.p1Y}
                  stroke={themeStyles.boneStroke}
                  strokeWidth={2}
                  strokeDasharray="2,2"
                />
                <line
                  x1={ringJoints.p1X}
                  y1={ringJoints.p1Y}
                  x2={ringJoints.p2X}
                  y2={ringJoints.p2Y}
                  stroke={themeStyles.boneStroke}
                  strokeWidth={2}
                  strokeDasharray="2,2"
                />
                <line
                  x1={ringJoints.p2X}
                  y1={ringJoints.p2Y}
                  x2={ringJoints.tipX}
                  y2={ringJoints.tipY}
                  stroke={themeStyles.boneStroke}
                  strokeWidth={2}
                  strokeDasharray="2,2"
                />
                {/* Ring Joint Nodes */}
                <circle cx={ringJoints.baseX} cy={ringJoints.baseY} r={3.5} fill={themeStyles.jointFill} />
                <circle cx={ringJoints.p1X} cy={ringJoints.p1Y} r={3.5} fill={themeStyles.jointFill} />
                <circle cx={ringJoints.p2X} cy={ringJoints.p2Y} r={3} fill={themeStyles.jointFill} />
                <circle cx={ringJoints.tipX} cy={ringJoints.tipY} r={4} fill={themeStyles.jointFill} stroke={themeStyles.jointRing} strokeWidth={1.5} />

                {/* Pinky Skeleton Chain */}
                <line
                  x1={pinkyJoints.baseX}
                  y1={pinkyJoints.baseY}
                  x2={pinkyJoints.p1X}
                  y2={pinkyJoints.p1Y}
                  stroke={themeStyles.boneStroke}
                  strokeWidth={2}
                  strokeDasharray="2,2"
                />
                <line
                  x1={pinkyJoints.p1X}
                  y1={pinkyJoints.p1Y}
                  x2={pinkyJoints.p2X}
                  y2={pinkyJoints.p2Y}
                  stroke={themeStyles.boneStroke}
                  strokeWidth={2}
                  strokeDasharray="2,2"
                />
                <line
                  x1={pinkyJoints.p2X}
                  y1={pinkyJoints.p2Y}
                  x2={pinkyJoints.tipX}
                  y2={pinkyJoints.tipY}
                  stroke={themeStyles.boneStroke}
                  strokeWidth={2}
                  strokeDasharray="2,2"
                />
                {/* Pinky Joint Nodes */}
                <circle cx={pinkyJoints.baseX} cy={pinkyJoints.baseY} r={3.5} fill={themeStyles.jointFill} />
                <circle cx={pinkyJoints.p1X} cy={pinkyJoints.p1Y} r={3.5} fill={themeStyles.jointFill} />
                <circle cx={pinkyJoints.p2X} cy={pinkyJoints.p2Y} r={3} fill={themeStyles.jointFill} />
                <circle cx={pinkyJoints.tipX} cy={pinkyJoints.tipY} r={4} fill={themeStyles.jointFill} stroke={themeStyles.jointRing} strokeWidth={1.5} />

                {/* Thumb Skeleton Node */}
                <circle cx={pose.thumb.tipX} cy={pose.thumb.tipY} r={4.5} fill={themeStyles.jointFill} stroke={themeStyles.jointRing} strokeWidth={1.5} />
              </g>
            )}

            {/* Animated Motion Trace for J and Z */}
            {pose.hasMotion === 'j_swoop' && (
              <g className="animate-pulse">
                <path
                  d="M 230 140 C 235 220, 200 280, 160 270 C 130 262, 135 230, 150 220"
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth={3.5}
                  strokeDasharray="6,4"
                  strokeLinecap="round"
                />
                {/* Arrowhead */}
                <polygon points="148,212 160,222 144,228" fill="#f59e0b" />
              </g>
            )}

            {pose.hasMotion === 'z_zigzag' && (
              <g className="animate-pulse">
                <path
                  d="M 110 90 L 195 90 L 115 155 L 205 155"
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth={3.5}
                  strokeDasharray="6,4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {/* Arrowhead */}
                <polygon points="200,147 212,155 200,163" fill="#f59e0b" />
              </g>
            )}
          </g>
        </svg>
      </div>

      {/* Visual Gesture Confirmation Footer (Zero textual instruction clutter) */}
      <div className="px-4 py-2.5 bg-slate-900/80 border-t border-slate-800/80 flex items-center justify-between gap-3 text-xs shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          <span className="font-extrabold text-white">
            ASL Sign for "{charUpper}"
          </span>
          <span className="text-[11px] text-slate-400">
            · {pose.category}
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
          <span className="hidden sm:inline text-purple-400 font-semibold">{pose.visualHint}</span>
        </div>
      </div>
    </div>
  );
};

export default VirtualHandSign;
