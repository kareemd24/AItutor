export interface ConceptGuide {
  /** The term, translated before any specialist detail appears. */
  plain: string
  /** A concrete link back to the worked “The capital of France is” request. */
  prompt: string
  /** Optional visible sequence for concepts that are easier to learn as a process. */
  steps?: string[]
  /** A misconception worth stopping before it forms. */
  caution?: string
}

/**
 * Every tappable concept gets a deliberately nontechnical entry. The detailed
 * `note` in each module can then add precision without having to do two jobs at
 * once. Keeping this separate also makes missing beginner explanations easy to
 * detect in tests.
 */
export const CONCEPT_GUIDES: Record<string, ConceptGuide> = {
  // ---------------------------------------------------------------- token path
  'tp.prompt': {
    plain: 'This is the sentence you send to the AI. It is the starting material for everything that follows.',
    prompt: 'Our worked request is “The capital of France is.” We keep following that exact text so each later stage has a concrete purpose.',
  },
  'tp.text': {
    plain: 'Raw text is the ordinary string of letters, spaces, and punctuation that you typed.',
    prompt: 'At this instant, “France” is still six letters. The model has not interpreted it yet.',
  },
  'tp.tok': {
    plain: 'A tokenizer is a fixed set of splitting rules. It turns text into numbered pieces called tokens—the units the model actually accepts.',
    prompt: 'Here it turns the sentence into five pieces, including “ France” with its leading space. Different models can split the same sentence differently.',
    steps: ['Read the exact characters.', 'Match common text pieces.', 'Replace each piece with its vocabulary ID.'],
  },
  'tp.embed': {
    plain: 'An embedding replaces each token ID with a long list of learned numbers. That list is the model’s starting representation of the token.',
    prompt: 'The ID for “ France” retrieves one vector. It begins near related learned patterns, but only later layers learn what “France” means in this sentence.',
    caution: 'An embedding is not a dictionary definition or a database row containing a fact.',
  },
  'tp.prefill': {
    plain: 'Prefill is the first pass through the model. It reads the whole prompt and prepares the internal state needed to begin answering.',
    prompt: 'All five prompt positions pass through every transformer layer. When prefill ends, the model is ready to score the first answer token.',
    steps: ['Read all prompt tokens.', 'Build context through every layer.', 'Store reusable attention state.', 'Produce the first next-token scores.'],
  },
  'tp.parallel': {
    plain: 'During prefill, the hardware can work on many prompt positions together instead of waiting for one to finish before starting the next.',
    prompt: '“The,” “capital,” “of,” “France,” and “is” move through a layer side by side, although each position may only look to its left.',
  },
  'tp.attn': {
    plain: 'Attention is the context-sharing step. It lets each token position pull useful information from earlier positions.',
    prompt: 'The position for “is” can pull signals from “France” and “capital,” so its current representation now reflects the phrase around it.',
    caution: 'Attention does not choose the answer by itself; it only updates the information carried at each position.',
  },
  'tp.qkv': {
    plain: 'The model makes three temporary versions of each position: a query for what it needs, a key for how it can be matched, and a value carrying information to share.',
    prompt: 'The query at “is” is compared with keys from earlier tokens. Strong matches decide which value mixtures are brought into the “is” position.',
    caution: '“Question, label, and cargo” is an analogy for matrix operations, not literal English stored in three boxes.',
  },
  'tp.scores': {
    plain: 'The model turns match strengths into percentages, then uses those percentages to blend information from earlier positions.',
    prompt: 'In the illustration, “is” borrows more from “France” than from less relevant tokens. The displayed numbers are an example, not a reading from a specific model.',
  },
  'tp.attnex': {
    plain: 'This mini-picture shows one possible attention pattern: thicker lines mean a stronger information pull.',
    prompt: 'It shows “is” pulling context from “France” and “capital.” Real models repeat this with many heads across many layers, so no single line explains the answer.',
  },
  'tp.ffn': {
    plain: 'FFN stands for feed-forward network: the numbers move through a fixed expand → gate → compress sequence, with no loop inside the stage. The same learned recipe is applied independently to every token position.',
    prompt: 'After attention has brought “France” and “capital” into the state at “is,” the FFN transforms that combined state. Across many layers, updates like this can strengthen patterns compatible with a city name coming next.',
    steps: ['Start with one token’s context-rich vector.', 'Expand it into many more feature slots.', 'Strengthen, weaken, or gate feature combinations.', 'Compress the result into one update.', 'Add that update back to the token’s running state.'],
    caution: 'The FFN does not open a “France → Paris” record. Knowledge is distributed across many weights, layers, attention steps, and FFN transformations.',
  },
  'tp.ffnex': {
    plain: 'The dots show the FFN’s expand–gate–compress shape. More temporary space lets the model form useful combinations that a single straight-line calculation could not.',
    prompt: 'For the “is” position, the input already contains surrounding context. The FFN produces a small update that may make a capital-city continuation more compatible with that context.',
    steps: ['Expand the vector.', 'Apply a learned nonlinear gate.', 'Compress to the original width.', 'Add the update back.'],
    caution: 'The highlighted dots are a teaching aid; individual neurons do not come with labels such as “geography.”',
  },
  'tp.ttft': {
    plain: 'Time to first token is how long you wait between sending a prompt and seeing the answer begin.',
    prompt: 'For our short prompt, this clock ends when “ Paris” is selected. Queueing and system overhead can add to the model’s own work.',
  },
  'tp.decode': {
    plain: 'Decode is the answer-writing loop. The model runs once, chooses one new token, appends it, and repeats.',
    prompt: 'The first loop chooses “ Paris”; the next might choose a period. Standard generation cannot finish the entire sentence in one ordinary decode step.',
    steps: ['Read the newest position plus cached history.', 'Run it through every layer.', 'Score possible next tokens.', 'Choose one and append it.', 'Repeat until stopping.'],
  },
  'tp.last': {
    plain: 'On each decode lap, the newly appended token is the only position that needs a fresh full pass.',
    prompt: 'Once “ Paris” is appended, its representation is computed while the prompt’s earlier attention information is reused from memory.',
  },
  'tp.attn2': {
    plain: 'Decode attention compares the newest token with stored information from the earlier sequence.',
    prompt: 'The new “ Paris” position can look back across “The capital of France is” without recreating all of those earlier keys and values.',
  },
  'tp.ffn2': {
    plain: 'The newest position runs through the same learned expand → gate → compress recipe. Earlier tokens do not participate here; their useful information is already carried inside this position’s vector.',
    prompt: 'For “ Paris,” it refines the current state before the model decides what should follow—perhaps punctuation or the start of an explanation.',
  },
  'tp.logits': {
    plain: 'Logits are the model’s raw candidate scores. There is one score for every possible next token, before they are turned into probabilities.',
    prompt: 'The model might give “ Paris” a higher raw score than “ Lyon” or “ Berlin.” These bars are illustrative, not a measured output.',
  },
  'tp.sample': {
    plain: 'The sampler converts scores into a choice. Settings can make the choice more predictable or allow more variety.',
    prompt: 'A low-randomness setting is likely to choose the high-scoring “ Paris.” A creative prompt may use settings that give lower-ranked candidates more chance.',
  },
  'tp.newtok': {
    plain: 'The selected token becomes part of the sequence, so the next lap can use it as context.',
    prompt: 'The sequence is now “The capital of France is Paris.” The model must run again to decide whether to add a period or continue.',
  },
  'tp.stream': {
    plain: 'Streaming sends each finished token to your screen immediately instead of waiting for the whole answer.',
    prompt: 'You see “Paris” as soon as that decode lap finishes. The familiar typing effect is a series of individually delivered tokens.',
  },
  'tp.cache': {
    plain: 'The KV cache is the model’s working memory for this conversation. It stores attention ingredients from positions already processed.',
    prompt: 'Prefill stores the five prompt positions; decode adds “ Paris.” Reusing them makes generation much faster than rereading the full conversation each lap.',
    caution: 'It is a math cache, not a human-like memory or a permanent record of the conversation.',
  },
  'tp.kv': {
    plain: 'Every processed position leaves behind keys and values for each layer so future attention can refer back to it.',
    prompt: '“France” leaves many small layer-by-layer records. When “ Paris” is processed, its queries can match against those stored records.',
  },
  'tp.grow': {
    plain: 'The cache gets larger with every generated token, so long conversations consume more scarce accelerator memory.',
    prompt: 'Adding “ Paris” creates the next cache entry; every later word adds another until the request ends or old context is removed.',
  },

  // --------------------------------------------------------------- transformer
  'tf.embed': {
    plain: 'The input stage changes text pieces into numerical vectors—the format all later transformer layers can work with.',
    prompt: 'It turns our five token IDs into five starting vectors before any token has used the surrounding sentence.',
  },
  'tf.tokenizer': {
    plain: 'The tokenizer splits text into the model’s vocabulary pieces and assigns each one a number.',
    prompt: 'Our sentence becomes five token IDs. Those IDs, not the original letters, enter the transformer.',
  },
  'tf.tokembed': {
    plain: 'The token-embedding table is a learned lookup table: token ID in, starting vector out.',
    prompt: 'The “ France” ID selects one row of numbers. The row is the same in every sentence; context is added afterward.',
  },
  'tf.rope': {
    plain: 'RoPE is a position marker built into attention. It changes query and key vectors according to where their tokens sit.',
    prompt: 'It helps the model distinguish “capital of France” from the same words in a different order and judge how far “is” is from “France.”',
    caution: 'RoPE does not add a simple position number; it rotates pairs of vector values in a position-dependent way.',
  },
  'tf.attn': {
    plain: 'Attention is the communication half of a transformer block: token positions exchange selected information.',
    prompt: 'The “is” position can absorb information carried by “France” and “capital,” making its representation specific to this prompt.',
  },
  'tf.qkv': {
    plain: 'Three learned projections create matching signals (queries and keys) plus the information that will be moved (values).',
    prompt: 'At “is,” a query is matched with earlier keys; the resulting weights decide how much of each earlier value to mix in.',
  },
  'tf.scores': {
    plain: 'Attention scores measure how strongly one position should draw from each allowed earlier position.',
    prompt: 'A head may give “France” a stronger score than “The” while processing “is,” then blend their value vectors accordingly.',
  },
  'tf.heads': {
    plain: 'Multiple attention heads run different small matching systems in parallel. GQA lets several query heads share stored keys and values to save memory.',
    prompt: 'Different heads can capture different useful relationships in our sentence. Shared K/V groups reduce the memory cost while the answer is generated.',
  },
  'tf.kvcache': {
    plain: 'The KV cache keeps earlier attention ingredients ready for reuse during answer generation.',
    prompt: 'After the prompt is read, its stored keys and values are reused when producing “ Paris” and every later token.',
  },
  'tf.oproj': {
    plain: 'The output projection combines all attention heads into one update with the same width as the token’s running state.',
    prompt: 'All the heads’ findings about “is” are compressed into one update and added to that position’s representation.',
  },
  'tf.ffn': {
    plain: 'FFN means feed-forward network: numbers move through a fixed expand → gate → compress sequence, with no loop inside this stage. It is the block’s private-analysis half—the same learned recipe rewrites each token position separately, after attention has supplied context.',
    prompt: 'Attention first makes the “is” vector aware of “capital” and “France.” The FFN then tests and combines patterns in that context-rich vector, producing an update that can make a city-name continuation more plausible after many layers.',
    steps: ['Receive the current vector for “is.”', 'Project it into a wider temporary workspace.', 'Use a nonlinear gate so combinations can matter, not just sums.', 'Project the result back to the model width.', 'Add the update to the residual stream.'],
    caution: 'Calling the FFN “memory” is only a loose metaphor. The model does not retrieve a single stored France fact; the answer emerges from distributed computation across the network.',
  },
  'tf.up': {
    plain: 'The up projection opens a larger temporary workspace by turning one vector into a wider vector.',
    prompt: 'The context-rich “is” vector fans out into many learned feature combinations that can be tested in parallel.',
  },
  'tf.act': {
    plain: 'SwiGLU is a learned gate inside many modern FFNs. One branch proposes feature values and another smoothly controls how much passes through.',
    prompt: 'For the “is” position, some combinations are strengthened and others reduced according to the context already mixed in from the prompt.',
    caution: 'A dense SwiGLU usually computes the whole layer; it is not the same as routing a token to only a few MoE experts.',
  },
  'tf.down': {
    plain: 'The down projection compresses the wide temporary result back to the model’s normal vector size.',
    prompt: 'It turns the FFN’s many intermediate feature combinations into one compact update for the “is” position.',
  },
  'tf.moe': {
    plain: 'In a mixture-of-experts model, a router chooses a small number of alternative FFNs to process each token.',
    prompt: 'The “is” position may be sent to two experts while another token uses different ones. This lowers active computation relative to running every expert.',
    caution: 'Experts are learned weight blocks, not reliably named human subjects such as a “geography expert.”',
  },
  'tf.head': {
    plain: 'The output head is the model’s final translator from an internal vector to candidate next-token scores.',
    prompt: 'After the last layer has refined “is,” this stage scores “ Paris” and every other token in the vocabulary.',
  },
  'tf.unembed': {
    plain: 'Unembedding compares the final vector with a learned direction for every vocabulary token, producing one raw score per candidate.',
    prompt: 'The final “is” vector lines up strongly with the direction for “ Paris,” giving it a high logit in our illustration.',
  },
  'tf.sampler': {
    plain: 'Sampling is the policy for turning candidate scores into the one token that will actually be emitted.',
    prompt: 'It chooses “ Paris” here. Temperature and top-p can change how willing the system is to choose a lower-ranked alternative.',
  },
  'tf.norm': {
    plain: 'RMSNorm keeps a vector’s overall signal level in a useful range before a sub-layer processes it.',
    prompt: 'Before attention or the FFN reads the “is” vector, normalization prevents an unusually large magnitude from overwhelming the calculation.',
    caution: 'It rescales the signal; it does not decide which meaning is correct.',
  },
  'tf.residual': {
    plain: 'The residual stream is the running numerical state for each token position. Every block reads it and adds a refinement rather than replacing it.',
    prompt: 'The “is” state begins as an embedding, gains context from attention, gains transformations from FFNs, and reaches the output head after many added updates.',
    steps: ['Carry the current state forward.', 'Let attention add context.', 'Let the FFN add a transformation.', 'Repeat through the next block.'],
  },

  // ---------------------------------------------------------------- inference
  'inf.timeline': {
    plain: 'A serving worker is the hardware process running model requests. It interleaves work from several users to avoid wasting expensive capacity.',
    prompt: 'Our short France request is one row among other conversations sharing the same worker.',
  },
  'inf.you': {
    plain: 'This row is your request as the operator sees it: a short prompt-processing burst followed by token-generation ticks.',
    prompt: 'The tiny row contains all the model work that turns “The capital of France is” into “ Paris.”',
  },
  'inf.bigdoc': {
    plain: 'A very long request needs much more prompt-processing work and memory than a short chat.',
    prompt: 'Another user’s 100,000-token document can compete with our five-token prompt, so the scheduler must keep it from monopolizing the worker.',
  },
  'inf.prefix': {
    plain: 'A prefix cache reuses model work for an identical beginning that was processed earlier and is still stored.',
    prompt: 'If many users share the exact same system instructions before their question, our request may reuse that part and only process the new France text.',
    caution: 'Reuse requires an exact matching prefix and available cached blocks; it does not happen for every similar-looking prompt.',
  },
  'inf.prefill': {
    plain: 'The prefill burst is the concentrated work of reading a request’s prompt before answer tokens begin.',
    prompt: 'Our five-token prompt creates a short burst; the 100,000-token document creates a much larger one.',
  },
  'inf.ttft': {
    plain: 'Time to first token measures the wait until the answer starts, including queue time and prompt processing.',
    prompt: 'The clock stops when our first visible token, “ Paris,” is ready.',
  },
  'inf.autoreg': {
    plain: 'Autoregressive decode means generating one new token from all tokens seen so far, then repeating with that token included.',
    prompt: 'One tick produces “ Paris”; another may produce “.” Each tick runs the model again.',
  },
  'inf.tpot': {
    plain: 'Inter-token latency is the time gap between consecutive output tokens after the answer has started.',
    prompt: 'It is the pause between seeing “Paris” and seeing the next piece of the response. Smaller gaps feel like faster typing.',
  },
  'inf.chunked': {
    plain: 'Chunked prefill breaks a long prompt into smaller pieces so other urgent work can run between them.',
    prompt: 'The scheduler can pause the giant PDF between chunks to keep our “ Paris” decode tick moving.',
  },
  'inf.contbatch': {
    plain: 'Continuous batching lets requests join and leave the active group at different times instead of waiting for a fixed batch to finish.',
    prompt: 'Our short request can enter an open slot and leave as soon as its answer ends, improving utilization without forcing all users into the same schedule.',
  },
  'inf.kvmem': {
    plain: 'The serving system divides KV-cache memory into manageable blocks and assigns blocks to active conversations.',
    prompt: 'Our prompt owns a few blocks; the long PDF owns many. The allocator tracks both on the same accelerator.',
  },
  'inf.paged': {
    plain: 'PagedAttention is a memory-management method for KV caches. A conversation can use scattered fixed-size blocks instead of needing one perfectly contiguous reservation.',
    prompt: 'As our answer grows, the system can assign another free block without moving the existing France-prompt cache.',
  },
  'inf.kvgrow': {
    plain: 'Each generated token adds more KV state. Full blocks trigger allocation of another memory page; finished requests release theirs.',
    prompt: '“ Paris” adds state to our pages, while a completed user’s pages can immediately be reused by someone else.',
  },
  'inf.spec': {
    plain: 'Speculative decoding uses a smaller, cheaper model to guess several tokens ahead, then asks the main model to check them together.',
    prompt: 'The small model guesses “ Paris”, “.”, and “ The.” If the main model accepts the first two, two answer tokens advance for roughly one verification pass.',
    caution: 'The main model remains the authority; speedup depends on how often its choices agree with the draft.',
  },
  'inf.draft': {
    plain: 'The draft model is the fast guesser in speculative decoding. It proposes likely continuation tokens at low cost.',
    prompt: 'It predicts that our sentence continues with “ Paris.” A poor guess will be rejected rather than silently changing the target model.',
  },
  'inf.verify': {
    plain: 'The verification pass lets the main model score several draft positions in parallel and accept only a valid prefix of guesses.',
    prompt: 'It can approve “ Paris” and “.” together, then resume ordinary generation where the draft diverges.',
  },
  'inf.accept': {
    plain: 'Acceptance rate is the share of draft tokens the main model keeps. Higher acceptance usually means more useful speedup.',
    prompt: 'Keeping two of three guesses lets our France sentence advance two positions before another target-model pass is needed.',
  },
  'inf.engine': {
    plain: 'This view opens one generation tick to show the data movement and computation hidden inside it.',
    prompt: 'It is the hardware work performed during the tick that emits “ Paris” or the token after it.',
  },
  'inf.wstream': {
    plain: 'Weight streaming means reading the model’s learned parameter bytes from high-bandwidth memory into compute units for a step.',
    prompt: 'Even though our prompt is short, producing “ Paris” may require touching a very large fraction of the model’s weights. Moving those bytes can take longer than the math.',
  },
  'inf.flash': {
    plain: 'FlashAttention rearranges exact attention work so intermediate pieces stay in small, fast on-chip memory instead of repeatedly visiting HBM.',
    prompt: 'When the newest token attends to our prompt, fewer round trips to HBM can reduce the time and memory traffic of that calculation.',
    caution: 'It changes how attention is computed, not the mathematical answer of attention apart from normal numerical precision effects.',
  },
  'inf.quant': {
    plain: 'Quantization stores or computes numbers with fewer bits. That makes the model smaller to move and often cheaper to run.',
    prompt: 'A lower-bit version can move the weights needed for our “ Paris” tick faster, provided the model still gives acceptable answers.',
  },
  'inf.disagg': {
    plain: 'Disaggregated serving uses different hardware pools for prompt reading and token generation, then transfers the request state between them.',
    prompt: 'Our prompt may be prefetched on a prefill worker and handed to a decode worker for “ Paris” and later tokens.',
    caution: 'The handoff itself costs network bandwidth and coordination, so separation is not automatically faster.',
  },

  // ---------------------------------------------------------------- training
  'tr.pre': {
    plain: 'Pretraining is the long first education phase. The model repeatedly hides the next text piece, guesses it, measures the error, and adjusts its weights.',
    prompt: 'Seeing examples such as “…capital of France is Paris” helps shape weights that later make “ Paris” likely for our prompt.',
  },
  'tr.data': {
    plain: 'Data curation is choosing, cleaning, filtering, and balancing the text used for training.',
    prompt: 'The model can only learn the France–Paris relationship reliably if its training data contains accurate, useful examples and not too much misleading duplication.',
  },
  'tr.ntp': {
    plain: 'Next-token prediction is the training game: given the text so far, assign high probability to the token that actually came next.',
    prompt: 'Given “…capital of France is,” the training target is “ Paris.” The model is rewarded for moving probability toward it.',
  },
  'tr.xent': {
    plain: 'Cross-entropy loss is a penalty number. A confident correct guess gets a small penalty; a weak or wrong guess gets a larger one.',
    prompt: 'If the model gives “ Paris” only 42% probability, the loss records room for improvement. Training tries to lower that penalty over many examples.',
  },
  'tr.backprop': {
    plain: 'Backpropagation works backward from the error to calculate how each weight contributed and which tiny change would reduce future error.',
    prompt: 'For the missed confidence on “ Paris,” it calculates correction directions through the output head, FFNs, attention layers, and embeddings.',
    caution: 'It does not write one fact into one location; enormous numbers of small updates reshape distributed behavior.',
  },
  'tr.adamw': {
    plain: 'AdamW is the rule that converts noisy correction directions into actual weight updates while controlling update size and weight growth.',
    prompt: 'It combines the “make Paris likelier” signal with running history from many other examples before nudging every affected parameter.',
  },
  'tr.scaling': {
    plain: 'Scaling laws are measured curves showing how average model error tends to improve as data, model size, and compute increase.',
    prompt: 'They help planners estimate how much additional training might improve next-token predictions like “ Paris,” not guarantee a particular capability.',
  },
  'tr.lr': {
    plain: 'The learning rate controls how large each weight update is; its schedule changes that size over the training run.',
    prompt: 'The correction from our example is applied gently enough to learn from it without erasing what the model learned from millions of other examples.',
  },
  'tr.post': {
    plain: 'Post-training takes a broadly capable predictor and shapes how it follows instructions, reasons, refuses, and communicates.',
    prompt: 'Pretraining may know Paris; post-training helps the model answer our prompt directly and clearly instead of merely continuing web-like text.',
  },
  'tr.sft': {
    plain: 'Supervised fine-tuning shows the model curated examples of prompts followed by good answers and trains it to imitate them.',
    prompt: 'An example might pair “What is the capital of France?” with “Paris.” This teaches the response format as well as the content.',
  },
  'tr.rlhf': {
    plain: 'RLHF uses human preferences to train a scoring model, then improves the assistant toward responses that score well.',
    prompt: 'Raters may prefer the clear answer “Paris is the capital of France” over a rambling or evasive response, shaping future behavior.',
  },
  'tr.dpo': {
    plain: 'DPO learns directly from pairs of preferred and rejected answers, without running a separate reinforcement-learning loop.',
    prompt: 'For our question, it can push the model toward a concise accurate answer and away from an inferior paired answer.',
  },
  'tr.distill': {
    plain: 'Distillation trains a smaller model to reproduce useful outputs or probability patterns from a larger teacher.',
    prompt: 'The student learns to answer “Paris” like the larger model while costing less to serve.',
  },
  'tr.rm': {
    plain: 'A reward model is a learned judge that scores candidate answers according to preference data.',
    prompt: 'It should give a clear accurate France answer a better score than a misleading one, though any learned judge can have blind spots.',
  },
  'tr.ppo': {
    plain: 'PPO is an update method used in classic RLHF. It improves reward while limiting how abruptly the model changes.',
    prompt: 'It can nudge the model toward preferred answers without letting one batch of France-style ratings radically rewrite the whole assistant.',
  },
  'tr.cai': {
    plain: 'Constitutional AI uses written principles and AI-generated critiques or preferences to supply much of the feedback for alignment.',
    prompt: 'The model can critique whether its France answer is accurate, relevant, and consistent with the chosen principles before training on the revision.',
  },
  'tr.rlvr': {
    plain: 'RLVR trains with rewards that can be checked automatically, such as a correct number or passing code tests.',
    prompt: '“Paris” can be checked against a known answer, but rich open-ended responses are harder to reduce to one reliable automatic verdict.',
  },
  'tr.dist': {
    plain: 'Distributed training splits an enormous learning job across many accelerators that must cooperate on each update.',
    prompt: 'Our France example may be processed on one worker while thousands of other examples run elsewhere; their correction signals are merged into one model update.',
  },
  'tr.dp': {
    plain: 'Data parallelism gives several workers copies of the model and different training examples, then combines their corrections.',
    prompt: 'One copy may process the France sentence while another processes code. Their gradients are averaged before both copies update.',
  },
  'tr.tp': {
    plain: 'Tensor parallelism splits one large matrix calculation across multiple GPUs because the matrix is too large or slow for one.',
    prompt: 'Even one layer processing our prompt may be divided across GPUs, which must exchange partial results before moving on.',
  },
  'tr.pp': {
    plain: 'Pipeline parallelism assigns different groups of model layers to different GPUs and moves batches through them like stations.',
    prompt: 'Our France example finishes early layers on one stage, then its activations move to the stage holding later layers.',
  },
  'tr.fsdp': {
    plain: 'FSDP and ZeRO divide model weights, gradients, and optimizer memory across workers so no single GPU stores every training byte.',
    prompt: 'The weights needed for our example’s current layer are gathered just in time, used, and then released or resharded.',
  },
  'tr.bf16': {
    plain: 'Mixed precision uses compact number formats for much of the math while keeping selected values more precise for stability.',
    prompt: 'The France example’s forward and backward calculations use fewer bytes and faster hardware paths without changing the learning objective.',
  },
  'tr.ckpt': {
    plain: 'Gradient checkpointing saves only selected intermediate results during the forward pass and recomputes the rest when needed for backpropagation.',
    prompt: 'Some activations from our example are deliberately discarded, then recreated during the backward pass to free memory for a larger model or batch.',
  },
  'tr.allreduce': {
    plain: 'All-reduce combines gradient numbers from all workers and gives the shared result back to each one.',
    prompt: 'The correction from the France example is summed with corrections from every other worker so all model copies take the same next step.',
  },

  // ----------------------------------------------------------------- silicon
  'si.gpu': {
    plain: 'A GPU die is the main piece of silicon that runs highly parallel AI math, surrounded by memory and support hardware.',
    prompt: 'The matrix calculations that turn our prompt into “ Paris” execute across many repeated regions on this die.',
  },
  'si.sm': {
    plain: 'A streaming multiprocessor is one repeated work team inside an NVIDIA GPU, with arithmetic units and nearby fast memory.',
    prompt: 'The model’s attention and FFN calculations are broken into small jobs and spread across many SMs at once.',
  },
  'si.tensor': {
    plain: 'A tensor core is specialized hardware for multiplying small blocks of numbers—the dominant operation in neural networks.',
    prompt: 'It performs chunks of the matrix multiplications used to create attention signals and FFN transformations for our tokens.',
  },
  'si.cuda': {
    plain: 'CUDA cores are more general arithmetic lanes that handle operations not suited to the tensor-core matrix engines.',
    prompt: 'They help with steps such as normalization, activation, indexing, and other glue around the large matrix multiplies.',
  },
  'si.l2': {
    plain: 'L2 is a shared on-chip cache that keeps recently used data closer to the compute units than HBM.',
    prompt: 'Useful tiles of weights or activations from our prompt may be reused here instead of making another slower trip to HBM.',
  },
  'si.shmem': {
    plain: 'Shared memory and L1 form a small, fast workspace inside each SM that software can use for actively processed tiles.',
    prompt: 'An attention kernel can hold a small slice of our prompt’s calculation here while it is being combined.',
  },
  'si.phy': {
    plain: 'HBM PHYs are the electrical doorways along the die edge that send and receive bits from nearby HBM stacks.',
    prompt: 'Model weights and the France prompt’s KV data pass through these circuits on their way to the compute units.',
  },
  'si.asic': {
    plain: 'An AI ASIC is a chip designed more narrowly around machine-learning workloads, trading flexibility for potential efficiency.',
    prompt: 'It can run the same matrix operations for our prompt using a more fixed dataflow than a general-purpose GPU.',
  },
  'si.systolic': {
    plain: 'A systolic array is a grid of simple math cells that passes data rhythmically from neighbor to neighbor while accumulating matrix results.',
    prompt: 'Blocks of embedding, attention, or FFN numbers for our prompt flow across the grid instead of repeatedly returning to distant memory.',
  },
  'si.vector': {
    plain: 'A vector unit handles rows of ordinary arithmetic that surround large matrix multiplications.',
    prompt: 'It can compute activation and normalization steps between the matrix operations used for our tokens.',
  },
  'si.srambuf': {
    plain: 'On-chip SRAM buffers are fast staging areas that hold data the matrix engines will need next.',
    prompt: 'The compiler tries to keep the current tiles of our prompt and model weights here so the array does not wait on external memory.',
  },
  'si.ici': {
    plain: 'An inter-chip interconnect is a direct high-speed path that lets several accelerator chips cooperate as one larger system.',
    prompt: 'If the model serving our prompt spans chips, partial layer results move across these links before the next operation can continue.',
  },
  'si.pkg': {
    plain: 'The package is the assembled physical system containing compute dies, HBM, fine wiring, a substrate, and power connections.',
    prompt: 'Our prompt benefits from HBM sitting millimeters from compute; the package is what makes that short, wide data path possible.',
  },
  'si.hbm': {
    plain: 'High-bandwidth memory is a stack of memory dies placed beside the processor to deliver many bytes in parallel.',
    prompt: 'It holds model weights and our conversation’s KV cache, feeding both to the chip while “ Paris” is calculated.',
  },
  'si.tsv': {
    plain: 'Through-silicon vias are tiny vertical electrical paths through stacked memory dies.',
    prompt: 'They let many bits of model or cache data move up and down the HBM tower at once before reaching the compute die.',
  },
  'si.interposer': {
    plain: 'A silicon interposer is a finely wired platform beneath the compute and memory dies, connecting them far more densely than a circuit board could.',
    prompt: 'The wide path carrying weights and KV data for our request crosses this interposer between HBM and compute.',
  },
  'si.chiplet': {
    plain: 'Chiplets divide a large processor into multiple dies joined inside one package instead of printing everything as one die.',
    prompt: 'Parts of the math for our prompt may cross a die-to-die bridge while software still presents the device as one accelerator.',
  },
  'si.reticle': {
    plain: 'The reticle limit is the largest area a lithography machine can expose in one shot, which limits the size of a single conventional die.',
    prompt: 'It does not change the France sentence; it shapes why the accelerator running that sentence may use multiple joined dies.',
  },
  'si.wafer': {
    plain: 'Wafer-scale integration uses much of a silicon wafer as one connected compute system, avoiding many ordinary chip boundaries.',
    prompt: 'The same model operations for our prompt can run on a much larger on-wafer fabric, with different trade-offs in power, cooling, and software.',
  },

  // ------------------------------------------------------------------ memory
  'mem.onchip': {
    plain: 'On-chip SRAM is the small, very fast memory built into the processor beside the arithmetic units.',
    prompt: 'The most actively used slices of our attention and FFN calculations live here briefly while “ Paris” is being computed.',
  },
  'mem.reg': {
    plain: 'Registers are the closest storage locations to the arithmetic units and hold values being used right now.',
    prompt: 'Tiny pieces of the matrix calculation for our current token sit in registers for immediate multiplication or addition.',
  },
  'mem.l1': {
    plain: 'Shared memory and L1 are small workbenches where a group of GPU threads can stage and reuse data.',
    prompt: 'An attention or FFN kernel brings in a tile of our token data and weights, uses it several times, then replaces it with the next tile.',
  },
  'mem.sram': {
    plain: 'An SRAM cell stores one bit with a small circuit of transistors. It is fast but physically expensive in chip area.',
    prompt: 'Millions of these cells form the on-chip workspaces that temporarily hold pieces of our prompt calculation.',
  },
  'mem.l2': {
    plain: 'L2 is a larger cache shared across the whole GPU, catching data before the chip must go out to HBM.',
    prompt: 'Reusable weights or prompt data may be served from L2, saving time and HBM bandwidth during a layer.',
  },
  'mem.inpkg': {
    plain: 'In-package memory sits beside the compute dies within the same physical package, close enough for a very wide connection.',
    prompt: 'This is where the model weights and the France request’s KV pages physically wait between calculations.',
  },
  'mem.hbm': {
    plain: 'HBM is the accelerator’s main high-speed memory pool: much larger than on-chip caches, but slower and farther from the math.',
    prompt: 'It stores the model and our KV cache. Every decode tick must move enough of those bytes to produce the next token.',
  },
  'mem.stack': {
    plain: '3D stacking piles memory dies vertically and connects them with many short wires, creating a wide path in a small footprint.',
    prompt: 'The stacked design supplies many weight and cache bytes in parallel while our prompt moves through the model.',
  },
  'mem.system': {
    plain: 'System memory and storage provide much more capacity than HBM, but data reaches the GPU over slower links.',
    prompt: 'Our live decode should avoid waiting here; these tiers are more likely to supply model files, datasets, or overflow capacity.',
  },
  'mem.ddr': {
    plain: 'Host DRAM is the server CPU’s main memory: roomy and relatively affordable, but much slower for the GPU to access than local HBM.',
    prompt: 'Request metadata may live here, but repeatedly fetching model weights from host memory would slow the “ Paris” generation loop.',
  },
  'mem.nvme': {
    plain: 'NVMe is flash storage for persistent files. It holds far more data than memory but cannot feed live model math at HBM speed.',
    prompt: 'The model checkpoint may be loaded from NVMe before service starts; our individual prompt should not wait for the model to reload each token.',
  },
  'mem.offload': {
    plain: 'Offloading moves data that does not fit in fast memory to a slower tier and brings it back when needed.',
    prompt: 'If model weights or our long KV history are offloaded, the system gains capacity but may add pauses before producing the next token.',
  },
  'mem.cxl': {
    plain: 'CXL can attach another coherent memory pool to a server over a PCIe-based connection, creating a larger but slower tier.',
    prompt: 'It may hold less urgent model or cache data, but using it during our live token loop is not equivalent to having that data in HBM.',
  },
  'mem.roofline': {
    plain: 'Arithmetic intensity asks how much calculation a workload does for every byte it must move. That ratio hints at whether math units or memory are the limiter.',
    prompt: 'Reading our prompt in a batch can reuse weights across many tokens; generating one token at a time often does less math per weight byte and becomes bandwidth-limited.',
  },
  'mem.wall': {
    plain: 'The memory wall is the growing gap between how fast chips can calculate and how fast enough data can reach those calculators.',
    prompt: 'Tensor cores may be ready for our next-token math while waiting for the model weights needed to produce “ Paris.”',
  },
  'mem.bwcap': {
    plain: 'Capacity is how much memory fits; bandwidth is how quickly bytes can move. A system can have enough of one and still be limited by the other.',
    prompt: 'The model and KV cache must fit in memory, while enough of their bytes must move each second to keep our answer responsive.',
  },

  // --------------------------------------------------------------------- rack
  'rk.rack': {
    plain: 'This rack is a complete AI computer assembled from 72 GPUs, CPUs, switches, power equipment, cooling, and thousands of links.',
    prompt: 'Our France request consumes only a tiny slice of this shared machine, but its response time and cost depend on the whole rack working together.',
  },
  'rk.uplinks': {
    plain: 'Fiber uplinks carry network traffic between this rack and the rest of the datacenter using light.',
    prompt: 'A short request may remain inside one rack, but model shards, retrieval data, or service traffic can cross these links before the answer returns.',
  },
  'rk.tor': {
    plain: 'Top-of-rack switches gather the network connections from equipment in one rack and connect them to the wider cluster.',
    prompt: 'If our request needs another rack, its data leaves through these switches; congestion can add delay even though the model math is unchanged.',
  },
  'rk.power': {
    plain: 'Power shelves convert facility electricity into the high-current DC supply used by the rack, with redundant units for resilience.',
    prompt: 'Every matrix multiplication for our prompt consumes part of this electrical supply. Available facility power limits how many such racks can run.',
  },
  'rk.busbar': {
    plain: 'A busbar is a thick shared copper conductor that distributes low-voltage, high-current power through the rack.',
    prompt: 'The accelerator producing “ Paris” draws power through this physical path while its compute units and memory operate.',
  },
  'rk.nvswtray': {
    plain: 'NVSwitch trays provide the high-speed switching that lets all 72 GPUs exchange data inside one tightly connected domain.',
    prompt: 'If our model is split across GPUs, partial layer results for the prompt cross these switches before computation can continue.',
  },
  'rk.backplane': {
    plain: 'The copper NVLink spine is the dense collection of short passive cables joining GPUs to NVSwitches within the rack.',
    prompt: 'Multi-GPU pieces of our prompt travel over these short copper paths, which save power compared with optical conversion at this distance.',
  },
  'rk.manifold': {
    plain: 'Coolant manifolds distribute liquid to hot components and collect the warmed return flow.',
    prompt: 'The energy used to calculate our answer becomes heat; this plumbing removes it so chips can keep their performance without overheating.',
  },
  'rk.tray': {
    plain: 'A compute tray is a removable one-rack-unit drawer containing CPUs, GPUs, memory, networking, power, and liquid connections.',
    prompt: 'The worker serving our request may occupy GPUs in one of these trays, while the other trays handle other users or parts of the model.',
  },
  'rk.bianca': {
    plain: 'A Bianca board is a building block pairing one Grace CPU with two Blackwell GPUs on the compute tray.',
    prompt: 'It provides the local processors and memory paths used to schedule and run a portion of our request.',
  },
  'rk.grace': {
    plain: 'Grace is the server CPU that handles orchestration, data movement, and general-purpose work around the GPUs.',
    prompt: 'It helps admit our request and manage data, while the GPUs do most of the neural-network matrix computation.',
  },
  'rk.lpddr': {
    plain: 'LPDDR5X is the Grace CPU’s larger, slower memory pool, useful for data that does not need HBM’s extreme bandwidth.',
    prompt: 'It may hold supporting data or overflow, but the latency-critical weight and KV traffic for “ Paris” prefers local HBM.',
  },
  'rk.nic': {
    plain: 'A network interface card is the tray’s high-speed doorway to other servers and racks; RDMA lets it move data with little CPU handling.',
    prompt: 'If the serving model or retrieved context lives elsewhere, the NIC moves the needed bytes before our request can proceed.',
  },
  'rk.blindmate': {
    plain: 'Blind-mate connectors automatically join power, cooling, and data when a tray slides into the rack.',
    prompt: 'They do not change our answer, but they make failed hardware easier to replace and therefore improve service availability.',
  },
  'rk.gpu': {
    plain: 'The Blackwell GPU module is the packaged accelerator: compute dies, HBM stacks, power delivery, interconnects, and cooling as one sellable unit.',
    prompt: 'This is the physical object that performs the transformer calculations needed to select “ Paris.”',
  },
  'rk.coldplate': {
    plain: 'A cold plate is a liquid-cooled metal block pressed against hot chips to carry heat away.',
    prompt: 'While the GPU computes our answer, electrical energy becomes heat here; good cooling lets the chip sustain speed for many users.',
  },
  'rk.die': {
    plain: 'Blackwell uses two large compute dies joined by an extremely fast in-package bridge so they act like one GPU.',
    prompt: 'A kernel processing our prompt can use resources across both dies, with the bridge carrying internal data when necessary.',
  },
  'rk.hbm': {
    plain: 'These HBM stacks are the GPU module’s nearby high-speed memory, shared by model weights, active data, and conversation caches.',
    prompt: 'The weights and KV state needed to generate “ Paris” are read from this pool.',
  },
  'rk.vrm': {
    plain: 'Voltage-regulator modules convert the rack supply into the very low voltage and enormous current the compute dies need.',
    prompt: 'They supply stable power during the brief surge of arithmetic for our prompt and during every other request running beside it.',
  },
  'rk.nvconn': {
    plain: 'The NVLink connector carries very high-bandwidth GPU-to-GPU traffic from this module into the rack’s NVSwitch fabric.',
    prompt: 'If our model spans multiple GPUs, its partial results leave and return through this connection during a layer.',
  },

  // --------------------------------------------------------------- datacenter
  'dc.node': {
    plain: 'A scale-up server or domain is a tightly connected group of accelerators that can cooperate with much faster links than an ordinary network.',
    prompt: 'The model serving our request ideally keeps its most frequent communication inside this fast boundary.',
  },
  'dc.nvlink': {
    plain: 'NVLink is NVIDIA’s direct high-bandwidth connection for moving data among GPUs and related components.',
    prompt: 'When one layer of our prompt is split across GPUs, partial results travel over NVLink before the layer finishes.',
  },
  'dc.nvswitch': {
    plain: 'NVSwitch is a dedicated switch that lets many NVLink-connected GPUs communicate without relying only on direct point-to-point paths.',
    prompt: 'It routes the multi-GPU data exchanges created while our prompt passes through a sharded model.',
  },
  'dc.pcie': {
    plain: 'PCIe is the standard server connection linking CPUs, storage, NICs, and accelerators. It is versatile but slower than specialized scale-up links.',
    prompt: 'Supporting data for our request may enter over PCIe, but tightly coupled GPU calculations try to stay on NVLink when available.',
  },
  'dc.nic': {
    plain: 'A NIC connects a server to the datacenter network; RDMA-capable NICs can move data directly between accelerator memory and the network.',
    prompt: 'If a model shard or retrieved document is remote, the NIC carries those bytes with less CPU copying.',
  },
  'dc.fabric': {
    plain: 'The cluster fabric is the network that joins many servers and racks into one large computing fleet.',
    prompt: 'Our short request may not cross racks, but a very large model, retrieval system, or busy service can depend on this network before responding.',
  },
  'dc.ib': {
    plain: 'InfiniBand is a network designed for low-latency, direct-memory communication and coordinated high-performance computing.',
    prompt: 'If parts of our model live in different servers, InfiniBand can carry their intermediate data so the next layer can continue.',
  },
  'dc.roce': {
    plain: 'RoCE provides RDMA-style direct memory transfers over an Ethernet network configured for low loss and controlled congestion.',
    prompt: 'It can carry remote model or retrieval data for our request, but poor congestion control can turn network delay into slower tokens.',
  },
  'dc.clos': {
    plain: 'A leaf-spine or Clos network gives racks several equal-length paths through leaf and spine switches, spreading traffic and avoiding one central bottleneck.',
    prompt: 'If our request needs a remote rack, its packets can take one of several paths; available fabric capacity affects whether it waits behind other jobs.',
  },
  'dc.tor': {
    plain: 'The top-of-rack switch is the first network hop for servers in a rack and their gateway to spine switches.',
    prompt: 'Remote data needed for our request enters or leaves the rack here.',
  },
  'dc.collective': {
    plain: 'All-reduce traffic is the coordinated exchange used to combine numbers held across many accelerators.',
    prompt: 'It is crucial while training the model that learned the France answer and can also appear in distributed inference, though a small single-rack request may avoid the scale-out fabric.',
  },
  'dc.rdma': {
    plain: 'RDMA lets a network adapter place data into another machine’s memory with little CPU involvement and fewer copies.',
    prompt: 'A remote model shard or retrieval service can deliver needed bytes faster before our “ Paris” token is produced.',
  },
  'dc.optics': {
    plain: 'The optical layer converts electrical data into light for longer links, carries it through fiber, then converts it back.',
    prompt: 'If our request crosses racks, some of its network bits travel through this conversion chain; if it stays local, optics still supports the shared cluster around it.',
  },
  'dc.xcvr': {
    plain: 'A pluggable transceiver is a removable module that converts a switch’s electrical signal to light and back.',
    prompt: 'Packets related to our request pass through one at each end of a fiber link when they leave the rack.',
  },
  'dc.laser': {
    plain: 'The laser supplies the steady light carrier used to send digital information through fiber.',
    prompt: 'The zeros and ones of remote request or model data ride on this light; the laser does not understand the prompt itself.',
  },
  'dc.mod': {
    plain: 'A modulator rapidly changes the light so it encodes the outgoing stream of digital data.',
    prompt: 'It places bits from our request’s network packets onto the optical carrier before they enter the fiber.',
  },
  'dc.pd': {
    plain: 'A photodetector converts arriving light pulses back into an electrical signal the receiving switch can process.',
    prompt: 'At the far end of a link, it recovers bits carrying remote model results or retrieval data for our request.',
  },
  'dc.dsp': {
    plain: 'A transceiver DSP cleans, equalizes, and decodes a very fast electrical signal so errors stay within limits.',
    prompt: 'It helps our network bits survive an imperfect high-speed link, but consumes power and adds cost at every optical port.',
  },
  'dc.fiber': {
    plain: 'Fiber is the glass path that carries light. Different core designs trade cost and distance.',
    prompt: 'If the France request needs another rack or building, its network traffic travels through these strands.',
  },
  'dc.sipho': {
    plain: 'Silicon photonics builds optical waveguides and modulators with chip-manufacturing techniques so many optical functions can be integrated densely.',
    prompt: 'It can reduce the power and space needed for the optical links supporting remote pieces of our service.',
  },
  'dc.cpo': {
    plain: 'Co-packaged optics moves optical engines beside the switch chip, shortening the difficult high-speed electrical path.',
    prompt: 'It aims to lower the network power tax around workloads like ours as clusters grow, though it does not change what the model computes.',
  },
  'dc.lpo': {
    plain: 'Linear-drive pluggable optics removes much of the module’s digital signal processing and drives the optical components more directly.',
    prompt: 'It may reduce link power and delay for traffic serving our request, but leaves less margin for imperfect signals and interoperability.',
  },
}

export function conceptGuideFor(itemId: string): ConceptGuide | undefined {
  return CONCEPT_GUIDES[itemId]
}
