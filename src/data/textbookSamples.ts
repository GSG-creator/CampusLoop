import { StructuredTextbookPage, EducationalVideoPrompt, QuizQuestionItem } from '../types/tutor';

export interface PreloadedSample {
  id: string;
  name: string;
  subject: string;
  grade: string;
  thumbnailColor: string;
  sampleQuestion: string;
  pageData: StructuredTextbookPage;
  defaultVideoPrompt: EducationalVideoPrompt;
  defaultQuiz: QuizQuestionItem[];
}

export const PRELOADED_SAMPLES: PreloadedSample[] = [
  {
    id: 'sample-newton-law',
    name: "Newton's Second Law of Motion",
    subject: 'Physics',
    grade: 'Grade 10',
    thumbnailColor: 'from-blue-600 to-indigo-800',
    sampleQuestion: 'Why does a heavier cart accelerate slower with the same push?',
    pageData: {
      id: 'sample-newton-law',
      subject: 'Physics',
      chapter: 'Chapter 9: Force and Laws of Motion',
      topic: "Newton's Second Law of Motion",
      gradeLevel: 'Grade 10 (CBSE & State Board)',
      page_summary:
        'The second law of motion states that the rate of change of momentum of an object is directly proportional to the applied unbalanced force in the direction of force. It mathematically establishes the relation between force, mass, and acceleration.',
      key_concepts: [
        'Force causes a change in velocity (acceleration)',
        'For a constant mass, acceleration is directly proportional to applied force (a ∝ F)',
        'For a constant force, acceleration is inversely proportional to mass (a ∝ 1/m)',
        'Momentum (p) equals mass times velocity (p = m × v)',
        'SI unit of force is the Newton (1 N = 1 kg·m/s²)',
      ],
      definitions: [
        {
          term: "Newton's Second Law",
          definition:
            'The acceleration of an object is directly proportional to the net force acting on it and inversely proportional to its mass.',
          simpleExplanation: 'Push harder → it speeds up faster. Make it heavier → it speeds up slower.',
        },
        {
          term: 'Newton (N)',
          definition:
            'The amount of net force required to accelerate a mass of 1 kilogram at a rate of 1 meter per second squared.',
          simpleExplanation: 'A small apple weighs about 1 Newton in your hand.',
        },
        {
          term: 'Momentum (p)',
          definition:
            'The quantity of motion of a moving body, measured as a product of its mass and velocity (p = mv).',
          simpleExplanation: 'How difficult it is to stop a moving object.',
        },
      ],
      equations: [
        {
          equation: 'F = m × a',
          variables: [
            { symbol: 'F', name: 'Net Force', meaning: 'The push or pull measured in Newtons (N)' },
            { symbol: 'm', name: 'Mass', meaning: 'The amount of matter measured in kilograms (kg)' },
            {
              symbol: 'a',
              name: 'Acceleration',
              meaning: 'Rate of change of velocity measured in meters per second squared (m/s²)',
            },
          ],
          purpose:
            'Calculates the force required to accelerate any mass, or finds acceleration when force and mass are known.',
          exampleProblem:
            'A student applies a net force of 10 Newtons on a 2 kg laboratory trolley. What is the acceleration?',
          stepByStepSolution: [
            '1. Identify given values: Force (F) = 10 N, Mass (m) = 2 kg.',
            '2. State formula: F = m × a, which rearranges to a = F / m.',
            '3. Substitute numbers: a = 10 N / 2 kg.',
            '4. Calculate result: a = 5 m/s².',
            '5. Conclusion: The trolley accelerates at 5 meters per second every second.',
          ],
        },
      ],
      examples: [
        {
          problem: 'Why does a cricket fielder pull his hands backward while catching a fast ball?',
          solution:
            'By pulling hands back, the fielder increases the time taken to bring the ball to rest (t). Since Force = Δp / Δt, increasing time reduces the rate of change of momentum, resulting in much less impact force on the hands.',
        },
      ],
      diagram_descriptions: [
        {
          title: 'Figure 9.3: Effect of Mass on Acceleration under Equal Applied Force',
          components: [
            { name: 'Cart A (Light: 5 kg)', role: 'Low mass object pushed with 20 N force' },
            { name: 'Cart B (Heavy: 20 kg)', role: 'High mass object pushed with same 20 N force' },
            { name: 'Force Vector Arrows (F = 20 N)', role: 'Shows identical forward push on both carts' },
            { name: 'Acceleration Vectors (a)', role: 'Long green arrow for Cart A; short arrow for Cart B' },
          ],
          interactions:
            'Both carts experience the exact same 20 N forward force. Because Cart B has 4× greater mass, its acceleration vector is 4× smaller (1 m/s² vs 4 m/s²).',
          overallProcess:
            'Demonstrates inverse relationship between mass and acceleration: heavier objects resist changes in motion more stubbornly (higher inertia).',
          diagramType: 'force_acceleration',
        },
      ],
      difficult_sections: [
        'Derivation of F = ma from rate of change of momentum (dp/dt)',
        'Understanding that acceleration is zero if forces are balanced (even when moving at steady speed)',
      ],
    },
    defaultVideoPrompt: {
      title: "Understanding Newton's Second Law in 60 Seconds",
      audience: 'Grade 10 School Students',
      subject: 'Physics',
      learningObjective:
        'Understand that force equals mass times acceleration (F = m × a) and why heavier objects accelerate slower with equal force.',
      style:
        'Clean educational animation, classroom-friendly, visually simple, high readability, minimal distractions.',
      scenes: [
        {
          sceneNumber: 1,
          durationSeconds: 15,
          visualDescription:
            'A clean pastel background shows a student standing on a school track with two carts: a light 5 kg red cart and a heavy 20 kg blue crate.',
          narration:
            'Imagine pushing two objects on a track. One is light, and the other is heavy. What happens when you push them with the exact same strength?',
          onScreenText: 'Equal Push • Different Masses',
          animationInstruction:
            'Student pushes both carts simultaneously with identical glowing 20 N force arrows.',
          transition: 'Smooth cut to close-up of moving carts',
        },
        {
          sceneNumber: 2,
          durationSeconds: 18,
          visualDescription:
            'The light red cart shoots forward with high acceleration. The heavy blue crate moves sluggishly.',
          narration:
            'The lighter cart zooms ahead quickly! The heavier crate accelerates much more slowly. This is Newton’s Second Law: acceleration depends directly on force, but inversely on mass.',
          onScreenText: 'More Mass = Slower Acceleration (a = F / m)',
          animationInstruction:
            'Display speedometers on both carts showing Cart A reaching 4 m/s² while Cart B reaches 1 m/s².',
          keyEquationOrLabel: 'a ∝ 1/m',
          transition: 'Fade to equation blackboard',
        },
        {
          sceneNumber: 3,
          durationSeconds: 17,
          visualDescription:
            'Large, crisp typography displays the iconic equation: F = m × a with color-coded variables.',
          narration:
            'Sir Isaac Newton wrote this as: Force equals mass multiplied by acceleration. F is force in Newtons. m is mass in kilograms. a is acceleration in meters per second squared.',
          onScreenText: 'F = m × a\nF = Force (N)\nm = Mass (kg)\na = Acceleration (m/s²)',
          animationInstruction:
            'Each variable glows as its spoken: F flashes amber, m flashes purple, a flashes emerald.',
          keyEquationOrLabel: 'F = m × a',
          transition: 'Zoom in on worked example',
        },
        {
          sceneNumber: 4,
          durationSeconds: 10,
          visualDescription:
            'A 2 kg ball receives a 10 N kick. Numbers plug cleanly into the equation.',
          narration:
            'If you kick a 2 kg ball with 10 Newtons of force: 10 divided by 2 gives an acceleration of 5 meters per second squared.',
          onScreenText: 'a = 10 N / 2 kg = 5 m/s²',
          animationInstruction:
            'Numbers float into equation slots and flash green with checkmark.',
          keyEquationOrLabel: 'a = 5 m/s²',
          transition: 'Fade to recap card',
        },
      ],
      keyEquationOrDiagram: 'F = m × a',
      endingSummary:
        'More force produces more acceleration, while more mass requires more force for the same acceleration.',
      finalCheck:
        'The video must not introduce facts, equations, terminology, or conclusions that are not supported by the analyzed textbook content unless they are explicitly labelled as additional context.',
      rawStructuredPromptText: `TITLE: Understanding Newton's Second Law in 60 Seconds
AUDIENCE: Grade 10 School Students
SUBJECT: Physics
LEARNING OBJECTIVE: Understand that force equals mass times acceleration (F = m × a) and why heavier objects accelerate slower with equal force.
STYLE: Clean educational animation, classroom-friendly, visually simple, high readability, minimal distractions.

SCENE 1:
Duration: 15s
Visual: A clean pastel background shows a student standing on a school track with two carts: a light 5 kg cart and a heavy 20 kg crate.
Narration: "Imagine pushing two objects on a track. One is light, and the other is heavy. What happens when you push them with the exact same strength?"
On-screen text: Equal Push • Different Masses

SCENE 2:
Duration: 18s
Visual: The lighter cart zooms ahead with a long green vector arrow while the heavy crate moves sluggishly.
Narration: "The lighter cart zooms ahead quickly! The heavier crate accelerates much more slowly. This is Newton’s Second Law: acceleration depends directly on force, but inversely on mass."
On-screen text: More Mass = Slower Acceleration (a = F / m)

SCENE 3:
Duration: 17s
Visual: Large, crisp typography displays F = m × a with color-coded variables and clear definition labels.
Narration: "Sir Isaac Newton wrote this as: Force equals mass multiplied by acceleration. F is force in Newtons. m is mass in kilograms. a is acceleration in meters per second squared."
On-screen text: F = m × a (F: Force, m: Mass, a: Acceleration)

SCENE 4:
Duration: 10s
Visual: A 2 kg soccer ball kicked with 10 N force demonstrates numerical substitution cleanly.
Narration: "If you kick a 2 kg ball with 10 Newtons of force: 10 divided by 2 gives an acceleration of 5 meters per second squared."
On-screen text: a = 10 N / 2 kg = 5 m/s²

KEY EQUATION: F = m × a
ENDING: More force produces more acceleration, while more mass requires more force for the same acceleration.
FINAL CHECK: Video based strictly on Chapter 9 textbook content.`,
    },
    defaultQuiz: [
      {
        id: 'q1',
        type: 'multiple_choice',
        question:
          'If the net force acting on an object is doubled while its mass stays constant, what happens to its acceleration?',
        options: ['It is halved (divided by 2)', 'It doubles (multiplied by 2)', 'It stays the same', 'It quadruples (multiplied by 4)'],
        correctAnswer: 1,
        conceptTested: 'Direct proportionality between Force and Acceleration (a ∝ F)',
        explanation:
          'Because acceleration is directly proportional to net force (a = F / m), doubling the force doubles the acceleration.',
        hint: 'Look at the equation a = F / m. If the top number doubles, what happens to a?',
      },
      {
        id: 'q2',
        type: 'true_false',
        question:
          'True or False: If two carts are pushed with the exact same force, the cart with greater mass will accelerate faster.',
        options: ['True', 'False'],
        correctAnswer: 1,
        conceptTested: 'Inverse relationship between Mass and Acceleration (a ∝ 1/m)',
        explanation:
          'False! Acceleration is inversely proportional to mass. Greater mass means greater inertia, so it accelerates slower.',
        hint: 'Think about pushing a shopping cart vs pushing a heavy car.',
      },
      {
        id: 'q3',
        type: 'application',
        question:
          'A student pushes a 4 kg box across a smooth frictionless floor with a net force of 12 Newtons. What is the acceleration of the box?',
        options: ['48 m/s²', '3 m/s²', '8 m/s²', '0.33 m/s²'],
        correctAnswer: 1,
        conceptTested: 'Applying the formula a = F / m',
        explanation:
          'Using Newton’s formula: a = F / m = 12 N / 4 kg = 3 m/s².',
        hint: 'Use a = Force divided by mass.',
      },
      {
        id: 'q4',
        type: 'multiple_choice',
        question: 'What is the standard SI unit of Force?',
        options: ['Joule (J)', 'Kilogram (kg)', 'Newton (N)', 'Watt (W)'],
        correctAnswer: 2,
        conceptTested: 'SI Units of physical quantities',
        explanation:
          'The SI unit of force is the Newton (N), named after Sir Isaac Newton. 1 N = 1 kg·m/s².',
      },
      {
        id: 'q5',
        type: 'short_answer',
        question:
          'Why does a cricket fielder pull his hands back while catching a high-speed ball?',
        options: [
          'To look stylish for the crowd',
          'To increase the impact time, which reduces the rate of change of momentum and impact force',
          'To increase the speed of the ball',
          'To make the ball heavier',
        ],
        correctAnswer: 1,
        conceptTested: 'Momentum and time in Newton’s Second Law (F = Δp / Δt)',
        explanation:
          'Extending the stopping time reduces the rate of change of momentum, cutting down the stinging force on the fielder’s palms.',
        hint: 'Think about how cushioning works: longer stopping time equals softer impact.',
      },
    ],
  },
  {
    id: 'sample-trigonometry-heights',
    name: 'Applications of Trigonometry (Heights & Distances)',
    subject: 'Mathematics',
    grade: 'Grade 10',
    thumbnailColor: 'from-emerald-600 to-teal-800',
    sampleQuestion: 'How do you know whether to use sin, cos, or tan for height problems?',
    pageData: {
      id: 'sample-trigonometry-heights',
      subject: 'Mathematics',
      chapter: 'Chapter 9: Some Applications of Trigonometry',
      topic: 'Heights and Distances & Angles of Elevation',
      gradeLevel: 'Grade 10 (CBSE)',
      page_summary:
        'Trigonometry is used to calculate unreachable heights and distances using right-angled triangles, line of sight, angle of elevation, and angle of depression.',
      key_concepts: [
        'Line of sight: line drawn from the eye of an observer to the object viewed',
        'Angle of elevation: angle formed by line of sight with horizontal level when looking upward',
        'Angle of depression: angle formed by line of sight with horizontal level when looking downward',
        'Tangent ratio: tan(θ) = Opposite / Adjacent = Height / Base Distance',
      ],
      definitions: [
        {
          term: 'Angle of Elevation',
          definition:
            'The angle between the horizontal plane and the observer’s line of sight directed upward toward an elevated point.',
          simpleExplanation: 'How much you must tilt your chin up from looking straight ahead.',
        },
        {
          term: 'Line of Sight',
          definition:
            'The straight line passing from the center of the observer’s pupil directly to the target point.',
          simpleExplanation: 'An imaginary laser beam straight from your eye to the target.',
        },
      ],
      equations: [
        {
          equation: 'tan(θ) = Opposite / Adjacent = Height / Distance',
          variables: [
            { symbol: 'θ', name: 'Angle of Elevation', meaning: 'Measured in degrees (30°, 45°, 60°)' },
            { symbol: 'Height', name: 'Opposite side', meaning: 'Vertical height of tower/tree' },
            { symbol: 'Distance', name: 'Adjacent side', meaning: 'Horizontal distance along the ground' },
          ],
          purpose:
            'Finds the vertical height of a distant structure without climbing it, by measuring ground distance and angle.',
          exampleProblem:
            'From a ground point 20 meters from the foot of a vertical tower, the angle of elevation is 60°. Find the height.',
          stepByStepSolution: [
            '1. Form right triangle: Base (Adjacent) = 20 m, Angle (θ) = 60°, Height (Opposite) = h.',
            '2. Select ratio: tan(θ) = Opposite / Adjacent => tan(60°) = h / 20.',
            '3. Substitute standard value: tan(60°) = √3 (~1.732).',
            '4. Solve for h: h = 20 × √3 = 20√3 meters (approximately 34.64 m).',
            '5. Conclusion: The height of the tower is 20√3 meters.',
          ],
        },
      ],
      examples: [
        {
          problem: 'When is angle of depression used?',
          solution:
            'When the observer is standing at the top (e.g. lighthouse or balcony) looking downward at a boat on the sea.',
        },
      ],
      diagram_descriptions: [
        {
          title: 'Figure 9.1: Right-angled Triangle of Observer and School Tower',
          components: [
            { name: 'Observer Eye (Point A)', role: 'Origin of horizontal line and line of sight' },
            { name: 'Tower Foot (Point B)', role: 'Base point on ground level, forming 90° right angle' },
            { name: 'Tower Top (Point C)', role: 'Observed target' },
            { name: 'Ground Distance AB = 20 m', role: 'Adjacent side' },
            { name: 'Tower Height BC = h', role: 'Opposite vertical side' },
            { name: 'Angle CAB = 60°', role: 'Angle of elevation' },
          ],
          interactions:
            'The ground distance and vertical tower form perpendicular legs. The line of sight forms the hypotenuse.',
          overallProcess:
            'Using the known base length and measured angle, the tangent trigonometric formula directly yields the unknown vertical height.',
          diagramType: 'trigonometry_height',
        },
      ],
      difficult_sections: [
        'Remembering to add observer height if the problem states observer is 1.5 m tall',
        'Converting angle of depression to alternate interior angle of elevation at ground level',
      ],
    },
    defaultVideoPrompt: {
      title: 'Measuring Impossible Heights with Trigonometry',
      audience: 'Grade 10 School Students',
      subject: 'Mathematics',
      learningObjective:
        'Understand line of sight, angle of elevation, and how tan(θ) = Height / Distance solves height problems without climbing.',
      style:
        'Clean educational animation, classroom-friendly, visually simple, high readability, minimal distractions.',
      scenes: [
        {
          sceneNumber: 1,
          durationSeconds: 15,
          visualDescription:
            'A student stands 20 meters away looking up at a tall school clock tower. A dashed horizontal line extends from her eye, and a solid line of sight points to the tower roof.',
          narration:
            'How can you measure the height of a giant tower without climbing it? All you need is your ground distance and the angle you tilt your eye upward.',
          onScreenText: 'Ground Distance = 20 m • Angle = 60°',
          animationInstruction: 'Dashed line and line of sight sweep into place forming a glowing angle arch.',
          transition: 'Pan to right triangle overlay',
        },
        {
          sceneNumber: 2,
          durationSeconds: 20,
          visualDescription:
            'A transparent blue right triangle outlines the ground (20 m), the vertical tower (h), and the sight line.',
          narration:
            'This forms a perfect right-angled triangle. The height is the Opposite side. The ground distance is the Adjacent side. In trigonometry, Opposite divided by Adjacent is the Tangent ratio!',
          onScreenText: 'tan(θ) = Opposite / Adjacent\ntan(60°) = Height / 20 m',
          animationInstruction: 'Highlight Opposite side in yellow and Adjacent side in cyan.',
          keyEquationOrLabel: 'tan(θ) = Opp / Adj',
          transition: 'Cross-dissolve to math calculation',
        },
        {
          sceneNumber: 3,
          durationSeconds: 15,
          visualDescription:
            'The value tan(60°) = √3 replaces the formula. Multiplication shows height = 20√3 m.',
          narration:
            'Since tan(60°) equals the square root of 3, multiply 20 by root 3. The exact height is 20 root 3 meters, or about 34.6 meters tall!',
          onScreenText: 'Height = 20 × √3 ≈ 34.64 m',
          animationInstruction: 'Equation resolves into answer box with golden celebratory glow.',
          keyEquationOrLabel: 'h = 20√3 m',
          transition: 'Fade to recap',
        },
      ],
      keyEquationOrDiagram: 'tan(θ) = Height / Distance',
      endingSummary:
        'Trigonometry turns distant heights into simple right-triangle multiplications using tangent ratios.',
      finalCheck: 'Based strictly on Chapter 9 CBSE mathematics syllabus.',
      rawStructuredPromptText: `TITLE: Measuring Impossible Heights with Trigonometry
AUDIENCE: Grade 10 School Students
SUBJECT: Mathematics
LEARNING OBJECTIVE: Understand line of sight, angle of elevation, and how tan(θ) = Height / Distance solves height problems without climbing.
STYLE: Clean educational animation, classroom-friendly, visually simple, high readability, minimal distractions.

SCENE 1:
Duration: 15s
Visual: A student stands 20 meters away looking up at a clock tower. Line of sight and horizontal level form an angle.
Narration: "How can you measure the height of a giant tower without climbing it? All you need is your ground distance and the angle you tilt your eye upward."
On-screen text: Ground Distance = 20 m • Angle = 60°

SCENE 2:
Duration: 20s
Visual: Clean right-angled triangle geometry outlines Opposite (Height) and Adjacent (Distance).
Narration: "This forms a right-angled triangle. The height is the Opposite side. The ground distance is the Adjacent side. In trigonometry, Opposite divided by Adjacent is the Tangent ratio!"
On-screen text: tan(θ) = Opposite / Adjacent

SCENE 3:
Duration: 15s
Visual: Step-by-step substitution of tan(60°) = √3 yielding height = 20√3 m.
Narration: "Since tan(60°) equals the square root of 3, multiply 20 by root 3. The exact height is 20 root 3 meters, or about 34.6 meters tall!"
On-screen text: Height = 20 × √3 ≈ 34.64 m

KEY EQUATION: tan(θ) = Height / Distance
ENDING: Trigonometry turns distant heights into simple right-triangle multiplications using tangent ratios.`,
    },
    defaultQuiz: [
      {
        id: 'qt1',
        type: 'multiple_choice',
        question: 'Which trigonometric ratio compares the Opposite side to the Adjacent side in a right triangle?',
        options: ['Sine (sin)', 'Cosine (cos)', 'Tangent (tan)', 'Cosecant (cosec)'],
        correctAnswer: 2,
        conceptTested: 'Trigonometric ratio definitions',
        explanation: 'tan(θ) = Opposite / Adjacent. (Remember mnemonic SOH CAH TOA).',
      },
      {
        id: 'qt2',
        type: 'application',
        question: 'A pole casts a shadow of equal length to its height. What is the angle of elevation of the sun?',
        options: ['30°', '45°', '60°', '90°'],
        correctAnswer: 1,
        conceptTested: 'tan(45°) = 1 condition',
        explanation:
          'When Height = Shadow, Opposite / Adjacent = 1. Since tan(45°) = 1, the elevation angle is 45°.',
      },
      {
        id: 'qt3',
        type: 'true_false',
        question:
          'True or False: An angle of depression is measured between the horizontal line of sight and an object lying BELOW eye level.',
        options: ['True', 'False'],
        correctAnswer: 0,
        conceptTested: 'Angle of depression definition',
        explanation: 'True! Looking down creates an angle of depression below the horizontal plane.',
      },
    ],
  },
];
