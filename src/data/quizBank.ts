import { QuizQuestion } from '../types';

export const PREDEFINED_QUIZZES: Record<string, QuizQuestion[]> = {
  'Applications of Trigonometry': [
    {
      id: 'trig-q1',
      question:
        'A vertical tower stands on level ground. From a point on the ground 20 m away from the foot of the tower, the angle of elevation of the top is observed to be 60°. What is the height of the tower?',
      options: ['10√3 m', '20√3 m', '20 m', '40 m'],
      correctOptionIndex: 1, // 20√3 m (tan 60° = h/20 => h = 20√3)
      explanation: 'tan(60°) = height / distance => √3 = h / 20 => h = 20√3 m.',
    },
    {
      id: 'trig-q2',
      question:
        'If the angle of elevation of the sun is 45°, what is the ratio of the height of a vertical pole to the length of its shadow on the ground?',
      options: ['1 : 2', '√3 : 1', '1 : 1', '1 : √3'],
      correctOptionIndex: 2, // 1 : 1 (tan 45° = 1)
      explanation: 'tan(45°) = height / shadow = 1, so the ratio is 1 : 1.',
    },
    {
      id: 'trig-q3',
      question:
        'A kite is flying at a height of 60 m above the ground attached to a string inclined at 60° to the horizontal. Assuming there is no slack in the string, what is the length of the string?',
      options: ['40√3 m', '120 m', '60√3 m', '80 m'],
      correctOptionIndex: 0, // 40√3 m (sin 60° = 60/L => L = 60/(√3/2) = 120/√3 = 40√3)
      explanation: 'sin(60°) = opposite / hypotenuse => √3/2 = 60 / L => L = 120 / √3 = 40√3 m.',
    },
  ],
  'Kinematics and Laws of Motion': [
    {
      id: 'phys-q1',
      question:
        'A ball is dropped freely from a height of 20 m. Taking g = 10 m/s², what is its velocity just before hitting the ground?',
      options: ['10 m/s', '20 m/s', '15 m/s', '25 m/s'],
      correctOptionIndex: 1, // v^2 = 2gh => v = sqrt(2*10*20) = 20 m/s
      explanation: 'v² = u² + 2gh = 0 + 2(10)(20) = 400 => v = 20 m/s.',
    },
    {
      id: 'phys-q2',
      question:
        'Newton’s Second Law of Motion relates net external force directly to which of the following quantities?',
      options: ['Velocity', 'Rate of change of momentum', 'Total inertia', 'Kinetic energy'],
      correctOptionIndex: 1, // Rate of change of momentum
      explanation: 'Force is defined as F = dp/dt (rate of change of linear momentum).',
    },
    {
      id: 'phys-q3',
      question:
        'When a bus suddenly turns a corner, passengers lean towards the outside due to which phenomenon?',
      options: ['Centripetal attraction', 'Inertia of direction', 'Friction reduction', 'Gravity tilt'],
      correctOptionIndex: 1, // Inertia of direction
      explanation: 'Due to inertia of direction, the body resists the change in straight-line direction.',
    },
  ],
  'General Science': [
    {
      id: 'gen-q1',
      question: 'Which of the following represents Ohm’s Law for an ohmic conductor?',
      options: ['V = I / R', 'V = I · R', 'I = V · R', 'R = V · I'],
      correctOptionIndex: 1,
      explanation: 'Ohm’s law states potential difference V is proportional to current I: V = I·R.',
    },
    {
      id: 'gen-q2',
      question: 'What is the SI unit of electric potential difference?',
      options: ['Ampere', 'Joule', 'Volt', 'Ohm'],
      correctOptionIndex: 2,
      explanation: 'The SI unit of potential difference is the Volt (V = J/C).',
    },
    {
      id: 'gen-q3',
      question: 'The power of a convex lens having a focal length of 0.5 meters is:',
      options: ['+0.5 D', '+2.0 D', '-2.0 D', '+1.0 D'],
      correctOptionIndex: 1,
      explanation: 'Power P = 1 / f(in meters) = 1 / 0.5 = +2.0 Diopters.',
    },
  ],
};

export function getQuizForTopic(topic: string): QuizQuestion[] {
  // Check exact or partial matches
  if (topic.toLowerCase().includes('trigonometry')) {
    return PREDEFINED_QUIZZES['Applications of Trigonometry'];
  }
  if (
    topic.toLowerCase().includes('physic') ||
    topic.toLowerCase().includes('motion') ||
    topic.toLowerCase().includes('mechanic')
  ) {
    return PREDEFINED_QUIZZES['Kinematics and Laws of Motion'];
  }
  return PREDEFINED_QUIZZES['General Science'];
}
