import * as fs from "fs";
import * as path from "path";
import { uploadToS3 } from "../src/lib/s3";
import * as dotenv from "dotenv";

dotenv.config();

const questions = [
  {
    id: "ai-ml-ml-basics-1",
    question: "What is the difference between Supervised, Unsupervised, and Reinforcement Learning?",
    difficulty: "Beginner",
    frequency: 5,
    lastVerified: "2026-09-28",
    answer: {
      quickAnswer: "Supervised learning uses labeled data to predict outcomes, unsupervised learning finds hidden patterns in unlabeled data, and reinforcement learning trains an agent to make decisions through trial and error using rewards.",
      mentalModel: "Supervised is learning with a teacher (flashcards with answers). Unsupervised is learning by sorting (grouping similar toys without knowing their names). Reinforcement is learning like training a dog (give a treat for good behavior).",
      whatItIs: "These are the three main paradigms of Machine Learning. Supervised learning maps an input to an output based on example input-output pairs (e.g., classification, regression). Unsupervised learning draws inferences from datasets consisting of input data without labeled responses (e.g., clustering). Reinforcement learning concerns how software agents ought to take actions in an environment to maximize some notion of cumulative reward.",
      whyItExists: "Different real-world problems have different data availability. We don't always have labeled data (hence unsupervised), and sometimes we need a system to make a sequence of decisions in a dynamic environment rather than a single prediction (hence reinforcement).",
      codeDemo: {
        language: "python",
        code: `// Supervised (Classification)
from sklearn.linear_model import LogisticRegression
model = LogisticRegression()
model.fit(X_train, y_labeled_train)

// Unsupervised (Clustering)
from sklearn.cluster import KMeans
kmeans = KMeans(n_clusters=3)
kmeans.fit(X_unlabeled_data)`
      },
      tradeOffs: "Supervised learning requires expensive and time-consuming manual labeling. Unsupervised learning results can be subjective and hard to evaluate. Reinforcement learning is notoriously difficult to train, often requiring massive compute and simulation environments.",
      theyMightAskNext: [
        {
          question: "Can you give an example of a Reinforcement Learning use case?",
          answer: "Training AI for autonomous driving, robotics, or playing complex games like Chess and Go."
        }
      ],
      usedInProduction: "Supervised learning powers spam filters and image recognition. Unsupervised learning drives recommendation engines (grouping similar users). Reinforcement learning is used in algorithmic trading and robotics.",
      relatedTopics: [
        { title: "Model Training & Evaluation", id: "model-training" }
      ]
    }
  },
  {
    id: "ai-ml-model-training-1",
    question: "What is Overfitting and how do you prevent it?",
    difficulty: "Intermediate",
    frequency: 5,
    lastVerified: "2026-09-28",
    answer: {
      quickAnswer: "Overfitting occurs when a model learns the training data too well, capturing noise instead of the underlying pattern, leading to poor performance on new, unseen data.",
      mentalModel: "It’s like memorizing the exact answers to a practice math test instead of learning the formulas. You’ll score 100% on the practice test, but fail the real exam.",
      whatItIs: "A modeling error in machine learning where a function is too closely aligned to a limited set of data points. The model has high variance and low bias.",
      whyItExists: "Complex models (like deep neural networks) have enough capacity to memorize the training dataset. If trained for too long without constraints, they will optimize for the training set's specific noise.",
      codeDemo: {
        language: "python",
        code: `# Preventing overfitting using Early Stopping in Keras
from tensorflow.keras.callbacks import EarlyStopping

# Stop training when validation loss stops improving for 3 epochs
early_stopping = EarlyStopping(monitor='val_loss', patience=3)

model.fit(X_train, y_train, 
          validation_data=(X_val, y_val),
          callbacks=[early_stopping])`
      },
      tradeOffs: "Techniques to prevent overfitting (regularization, dropout, early stopping) can introduce bias. If you constrain the model too much, you risk 'Underfitting'—where the model is too simple to capture the underlying patterns.",
      theyMightAskNext: [
        {
          question: "What is L1 vs L2 Regularization?",
          answer: "L1 (Lasso) shrinks some weights to exactly zero (feature selection), while L2 (Ridge) shrinks weights evenly but rarely to zero."
        }
      ],
      usedInProduction: "In production, ML engineers strictly separate data into Training, Validation, and Test sets, and heavily rely on Dropout layers in deep learning to prevent overfitting.",
      relatedTopics: [
        { title: "Neural Networks Basics", id: "neural-networks" }
      ]
    }
  },
  {
    id: "ai-ml-neural-networks-1",
    question: "What is the purpose of an Activation Function in a Neural Network?",
    difficulty: "Intermediate",
    frequency: 4,
    lastVerified: "2026-09-28",
    answer: {
      quickAnswer: "Activation functions introduce non-linearity into the neural network, allowing it to learn complex, non-linear patterns rather than just simple linear regression.",
      mentalModel: "Think of it as a gatekeeper for a neuron. It decides whether the neuron should 'fire' (pass the signal forward) based on the inputs it received, similar to a biological synapse.",
      whatItIs: "A mathematical function applied to the output of a neural network node. Without it, no matter how many layers a neural network has, it would behave exactly like a single-layer linear perceptron because the sum of linear functions is just another linear function.",
      whyItExists: "Real-world data (images, audio, text) is highly non-linear. To map complex inputs to correct outputs, the network needs a way to curve and bend its decision boundaries.",
      codeDemo: {
        language: "python",
        code: `import torch.nn as nn

# Common Activation Functions in PyTorch
relu = nn.ReLU()       # f(x) = max(0, x)
sigmoid = nn.Sigmoid() # f(x) = 1 / (1 + e^-x)
tanh = nn.Tanh()       # f(x) = (e^x - e^-x) / (e^x + e^-x)`
      },
      tradeOffs: "Sigmoid and Tanh suffer from the 'vanishing gradient' problem where deep layers stop learning. ReLU solves this but can suffer from 'dying ReLU' where neurons output zero forever. Leaky ReLU is often used as a compromise.",
      theyMightAskNext: [
        {
          question: "Why is ReLU mostly used in hidden layers, but Sigmoid/Softmax in the output layer?",
          answer: "ReLU is fast and prevents vanishing gradients during training. Softmax/Sigmoid are used at the output to convert logits into probabilities for classification."
        }
      ],
      usedInProduction: "ReLU (and its variants like GELU) is the default activation function for hidden layers in almost all modern production deep learning models, including Transformers and CNNs.",
      relatedTopics: [
        { title: "Core ML Concepts", id: "ml-basics" }
      ]
    }
  },
  {
    id: "ai-ml-llms-rag-1",
    question: "Explain what RAG (Retrieval-Augmented Generation) is and why it is necessary.",
    difficulty: "Advanced",
    frequency: 5,
    lastVerified: "2026-09-28",
    answer: {
      quickAnswer: "RAG is a technique that grounds a Large Language Model (LLM) by fetching relevant private or real-time data from a database and injecting it into the prompt before generating an answer.",
      mentalModel: "It’s like an open-book exam. Instead of the LLM relying on what it memorized during training (which might be outdated), RAG allows the LLM to search the library for the exact page with the answer, and then summarize it for you.",
      whatItIs: "RAG combines an information retrieval system (usually a vector database) with a generative text model. When a user asks a query, the system embeds the query, retrieves the top-K most semantically similar document chunks, and passes those chunks to the LLM alongside the user's prompt.",
      whyItExists: "LLMs suffer from hallucinations, lack of access to private enterprise data, and have a knowledge cutoff date. Retraining or fine-tuning an LLM on daily changing data is prohibitively expensive. RAG solves this cleanly.",
      codeDemo: {
        language: "python",
        code: `# Conceptual RAG Flow
user_query = "What is our company's refund policy?"

# 1. Retrieve
query_embedding = embed_model.embed(user_query)
context_docs = vector_db.similarity_search(query_embedding, top_k=3)

# 2. Augment
prompt = f"Answer the user based on this context: {context_docs}. Query: {user_query}"

# 3. Generate
response = llm.generate(prompt)`
      },
      tradeOffs: "RAG adds latency to the system because you have to wait for the vector search before calling the LLM. It also requires maintaining an embedding pipeline and vector database infrastructure.",
      theyMightAskNext: [
        {
          question: "What is semantic search vs keyword search?",
          answer: "Keyword search matches exact words (BM25). Semantic search uses embeddings to match the meaning or intent (e.g., matching 'puppy' with 'dog')."
        }
      ],
      usedInProduction: "Almost all enterprise generative AI chatbots use RAG (often built with frameworks like LangChain or LlamaIndex) to allow employees to query internal Notion pages, Confluence docs, or codebases securely.",
      relatedTopics: [
        { title: "Core ML Concepts", id: "ml-basics" }
      ]
    }
  },
  {
    id: "ai-ml-deployment-1",
    question: "What is Model Drift in MLOps and how do you handle it?",
    difficulty: "Advanced",
    frequency: 4,
    lastVerified: "2026-09-28",
    answer: {
      quickAnswer: "Model drift is the degradation of a machine learning model's predictive accuracy over time because the real-world data it receives in production has changed compared to the data it was trained on.",
      mentalModel: "Imagine training a model in 2019 to predict flight prices. In 2020 (during COVID), travel patterns fundamentally changed. The 2019 model would fail miserably in 2020 because the world 'drifted' away from the training data.",
      whatItIs: "There are two main types: Data Drift (the distribution of input features changes) and Concept Drift (the statistical relationship between inputs and the target variable changes).",
      whyItExists: "The real world is dynamic. Consumer preferences change, economic conditions shift, and new trends emerge. A static model inevitably becomes stale.",
      codeDemo: {
        language: "python",
        code: `# Pseudo-code for detecting Data Drift in production
from evidently.metrics import DataDriftTable

# Compare production data distributions against training data baseline
drift_report = DataDriftTable()
drift_report.calculate(reference_data=training_df, current_data=production_df)

if drift_report.has_drift():
    alert_mlops_team()
    trigger_retraining_pipeline()`
      },
      tradeOffs: "Retraining models too frequently burns expensive compute resources and risks deploying unstable models. You must balance the cost of retraining against the business cost of a slightly degraded model.",
      theyMightAskNext: [
        {
          question: "How do you deploy a new model without impacting users?",
          answer: "Use Shadow Deployment (run the new model alongside the old, but don't use its predictions) or A/B Testing/Canary Releases to gradually shift traffic."
        }
      ],
      usedInProduction: "MLOps teams at companies like Netflix and Uber use continuous monitoring tools (like Arize or Evidently) to set up automated alerts for drift, triggering CI/CD pipelines to retrain models on the latest data.",
      relatedTopics: [
        { title: "Model Training & Evaluation", id: "model-training" }
      ]
    }
  }
];

async function publish() {
  console.log("Publishing AI/ML questions to S3...");
  for (const q of questions) {
    const parts = q.id.split("-");
    // ID format: ai-ml-topic-1 => subject is parts[0]-parts[1] (ai-ml)
    // topic is parts[2] or parts[2]-parts[3] depending on hyphens.
    // Let's explicitly map them based on our schema.
    let topicId = "";
    if (q.id.includes("ml-basics")) topicId = "ml-basics";
    if (q.id.includes("model-training")) topicId = "model-training";
    if (q.id.includes("neural-networks")) topicId = "neural-networks";
    if (q.id.includes("llms-rag")) topicId = "llms-rag";
    if (q.id.includes("deployment")) topicId = "deployment";

    const s3Key = `content/ai-ml/${topicId}/${q.id}.json`;
    await uploadToS3(s3Key, JSON.stringify(q, null, 2));
    console.log(`✅ Uploaded ${s3Key}`);
  }
}

publish().catch(console.error);
