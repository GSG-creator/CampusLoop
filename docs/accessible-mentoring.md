# Accessible mentoring plans

CampusLoop can help mentors prepare editable learning plans for learners with neurodegenerative conditions, intellectual or developmental disabilities, and other access needs. The plan starts with what a learner wants to do, their strengths and their chosen supports. These groups are not interchangeable, and a condition does not determine an individual’s ability, interests, communication or learning path. A diagnosis is neither required nor inferred.

The local planner proposes three connected lessons: connect and model, practise together, then recap and consolidate. Mentors should agree and edit the draft with the learner and teacher before use. Learning something new, maintaining a skill, practising a familiar routine or participating can each be a meaningful goal. Grade and topic identify the curriculum context, not a judgment about ability. The draft is a planning scaffold; the teacher or mentor checks and adapts its content and accessible materials.

## Concrete starter tasks and delivery

Recognized topics include a worked starter, a similar guided task and a choice of repetition or a small variation. The trigonometry sequence calculates a tower’s height using tangent: 20 m at 60° gives 20√3 m; the guided task uses 10 m; the optional variation uses 12 m at 45°. The kinematics sequence calculates falling speed from rest using explicitly stated gravity and air-resistance assumptions. General Science or Ohm’s law uses numerical examples of V = I × R for an ohmic resistor at constant temperature. Related materials include accessible quantity labels, equation reminders and checked examples. These are authored teaching examples drawing on the existing CampusLoop quiz topics, not a complete or accredited curriculum. No physical dropping or circuit-building task is required.

An unrecognized topic does not silently receive a science or mathematics exercise. The plan asks the mentor to supply a teacher-aligned example with checked reasoning and an answer. For every topic, the mentor should adapt or replace the starter to fit the learner’s goal and the teacher’s curriculum. The learner can observe, indicate a useful step, repeat a familiar task or try a variation; moving to a harder task is not compulsory.

Online sessions suggest agreeing an accessible platform and shared formats, including checking any captions, descriptions and response tools the learner needs. Offline sessions suggest checking the accessibility of the meeting space, desk, materials and preferred tools. These are planning prompts: CampusLoop does not provide video calling, captions, assistive technology or a physical venue. The selected mode does not change learning goals or infer ability.

## Teaching sources and how they inform the draft

Sources checked on 27 September 2026. Their inclusion is not an endorsement of CampusLoop or evidence that this generated plan has been evaluated.

| Source | Region and scope | Application in CampusLoop |
| --- | --- | --- |
| [Education Endowment Foundation: Five a day — supporting high-quality teaching for pupils with SEND](https://educationendowmentfoundation.org.uk/education-evidence/guidance-reports/supporting-high-quality-teaching-for-pupils-with-send) | England, UK; school teaching guidance drawing on research | Teacher modelling followed by guided practice and optional independent practice; cognitive organisers and checks of understanding. |
| [EEF: Scaffolding resource](https://d2tic4wvo1iusb.cloudfront.net/production/documents/five-a-day_principles_scaffolding_v.2.0.0.pdf?v=1747122326) | England, UK; examples of teaching supports | Step lists, familiar examples and prompts. Support is adapted to current need rather than removed on a fixed schedule. |
| [CAST Universal Design for Learning Guidelines 3.0](https://udlguidelines.cast.org/) | United States; educational design framework | Meaningful goals, learner agency, different ways to access information and demonstrate learning. |
| [CAST: Choice and autonomy](https://udlguidelines.cast.org/engagement/interests-identities/choice-autonomy/) | UDL consideration 7.1 | Learner and educator agree goals, examples, tools and activity choices. |
| [CAST: Response, navigation and movement](https://udlguidelines.cast.org/action-expression/interaction/response-navigation-movement/) | UDL consideration 4.1 | Spoken, typed, pointing/selection and demonstration options; flexible response time and physical access. |
| [CAST: Ways to perceive information](https://udlguidelines.cast.org/representation/perception/ways-perceive-information/) | UDL consideration 1.2 | Offer accessible text, audio, descriptions, objects/tactile or visual materials. Neither pictures nor audio are presumed accessible to everyone. |

The six support choices map to practical teaching adjustments:

- **Remembering:** retain useful cues or organisers and revisit familiar steps.
- **Processing:** present one instruction at a time and allow response time.
- **Reading:** clarify vocabulary and agree accessible formats.
- **Communication:** agree response methods and ways to request help or a pause.
- **Energy:** agree shorter blocks, rest or an earlier finish when requested.
- **Physical access:** use suitable controls, tools or learner-directed assistance.

Session length and break intervals are editable preferences. They are not clinical recommendations or claims about a particular condition. The review date initially uses the session date; it is a proposal for checking the teaching plan, not a medical review schedule. Existing school and professional recommendations take precedence. Subject examples, materials, communication tools and scaffolds need checking with the learner; the app cannot establish that they are appropriate by itself.

These sources offer general educational approaches. They do not establish effectiveness for every learner, validate a condition-specific curriculum, or guarantee improvement or prevention of decline. The feature does not diagnose, prescribe treatment or create a formal IEP. A peer mentor should work within the school’s arrangements and involve the teacher where needed.

## Local data and remote AI

`createLearningPlanDraft` is a local deterministic function: it reads the session’s topic, grade and optional learning-support preferences and returns editable text. It makes no network or AI call, does not infer diagnoses from free text, and does not change the session, credits or account permissions.

At the time of this implementation, `sendLoopAiQuery` sends a user-written chat message and a small explicitly listed demo context. It does not automatically transmit sessions, support preferences, plan drafts or local action cards. A user can still manually type or paste personal information into AI chat; that message is sent to the server and, when configured, the AI provider. Local demo storage and persona switching are not production access controls. Use non-sensitive demonstration data until appropriate school-approved storage, consent and access controls are implemented.

## Verification

The planning tests cover all six support choices, all four response modes, learner-provided goals and strengths, the three-lesson sequence, concrete worked/guided/recap examples, unknown-topic handling, online/offline delivery suggestions, field limits with every support selected, local generation without a network call, preservation of inputs, and isolation of support/plan fields from the AI request body. Mentors and learners must adapt and agree the plan, with appropriate teacher guidance. The app's recorded teacher-review step is optional; automated tests check application behavior, not educational or clinical outcomes.
