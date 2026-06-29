export interface QuizQuestion {
  id: string;
  category: string;
  name: string;
  question: string;
  options: string[];
  answer: number; // index of the correct option
  lesson: string;
  reward: number;
}

export const QUIZ_CATEGORIES = [
  'Programming',
  'DSA',
  'Linux',
  'Docker',
  'Kubernetes',
  'AI',
  'Web Development',
  'Databases',
  'Operating Systems',
  'Cybersecurity',
  'DevOps',
  'Cloud Computing',
  'Career Preparation',
  'Aptitude',
  'System Design'
];

export const quizBank: Record<string, Omit<QuizQuestion, 'category'>[]> = {
  'Programming': [
    {
      id: 'prog-1',
      name: 'Python Lists vs Tuples',
      question: 'What is the main difference between a list and a tuple in Python?',
      options: [
        'Tuples are mutable, lists are immutable',
        'Lists are mutable, tuples are immutable',
        'Lists cannot store duplicate values',
        'Tuples are faster for writing operations'
      ],
      answer: 1,
      lesson: 'In Python, lists are mutable (can be changed), whereas tuples are immutable sequence structures.',
      reward: 15
    },
    {
      id: 'prog-2',
      name: 'JavaScript Closures',
      question: 'What is a closure in JavaScript?',
      options: [
        'A function bundled with its lexical environment',
        'A way to close a browser window or tab',
        'A method to compress JS code bundle size',
        'A secure way to store passwords client-side'
      ],
      answer: 0,
      lesson: 'A closure is the combination of a function bundled together with references to its surrounding state (the lexical environment).',
      reward: 15
    },
    {
      id: 'prog-3',
      name: 'C++ Reference vs Pointer',
      question: 'In C++, how does a reference differ from a pointer?',
      options: [
        'A pointer cannot be null',
        'A reference can be re-assigned to point to another variable',
        'A reference must be initialized upon declaration and cannot be null',
        'Pointers do not use memory addresses'
      ],
      answer: 2,
      lesson: 'A C++ reference is an alias for an existing variable, must be initialized at declaration, and cannot be null, unlike pointers.',
      reward: 15
    },
    {
      id: 'prog-4',
      name: 'TypeScript Unknown Type',
      question: 'What does the "unknown" type in TypeScript represent?',
      options: [
        'A variable that has no type whatsoever',
        'A type-safe counterpart of "any"',
        'A type that can only hold string values',
        'An internal type used for compiler warnings only'
      ],
      answer: 1,
      lesson: 'The "unknown" type is a type-safe alternative to "any". Anything is assignable to unknown, but unknown is not assignable to anything else without type assertion or control flow analysis.',
      reward: 15
    },
    {
      id: 'prog-5',
      name: 'Java Static Keyword',
      question: 'In Java, what is the purpose of the "static" keyword?',
      options: [
        'It prevents a variable from being modified after creation',
        'It binds a method or field to the class rather than an instance',
        'It optimizes memory specifically for garbage collection',
        'It makes a class thread-safe automatically'
      ],
      answer: 1,
      lesson: 'The static keyword denotes that a member variable or method belongs to the class itself, rather than to individual instances.',
      reward: 15
    }
  ],
  'DSA': [
    {
      id: 'dsa-1',
      name: 'Binary Search Trees',
      question: 'What is the average time complexity of searching in a balanced Binary Search Tree (BST)?',
      options: ['O(1)', 'O(n)', 'O(log n)', 'O(n log n)'],
      answer: 2,
      lesson: 'A balanced BST halves the search space at each level, leading to logarithmic O(log n) average-case time complexity.',
      reward: 15
    },
    {
      id: 'dsa-2',
      name: 'Queue Principle',
      question: 'Which data structure operates on a First-In, First-Out (FIFO) basis?',
      options: ['Stack', 'Queue', 'Binary Tree', 'Max Heap'],
      answer: 1,
      lesson: 'A Queue processes elements in a First-In, First-Out sequence, whereas a Stack is Last-In, First-Out.',
      reward: 15
    },
    {
      id: 'dsa-3',
      name: 'Merge Sort Space',
      question: 'What is the worst-case space complexity of standard Merge Sort on an array?',
      options: ['O(1)', 'O(log n)', 'O(n)', 'O(n^2)'],
      answer: 2,
      lesson: 'Merge Sort requires O(n) auxiliary memory space to store temporary subarrays during the merging process.',
      reward: 15
    },
    {
      id: 'dsa-4',
      name: 'Shortest Path Algorithm',
      question: 'Which algorithm is best suited for finding the shortest path from a single source in a weighted graph with non-negative edges?',
      options: ["Prim's Algorithm", "Kruskal's Algorithm", "Dijkstra's Algorithm", "Floyd-Warshall Algorithm"],
      answer: 2,
      lesson: "Dijkstra's algorithm is the classic greedy algorithm for single-source shortest paths on non-negative weighted graphs.",
      reward: 15
    },
    {
      id: 'dsa-5',
      name: 'HashMap Collision Resolution',
      question: 'How does a HashMap resolve collisions using "separate chaining"?',
      options: [
        'By probing the next available index sequentially',
        'By storing colliding items in a linked list or tree at that index',
        'By resizing the hash table immediately',
        'By throwing a RuntimeException'
      ],
      answer: 1,
      lesson: 'Separate chaining stores colliding entries in a linked list or balanced tree at the specific bucket index.',
      reward: 15
    }
  ],
  'Linux': [
    {
      id: 'lin-1',
      name: 'Listing Files',
      question: 'Which of the following commands is used to list directory contents in long format?',
      options: ['ls -a', 'ls -l', 'ls -lh', 'list -l'],
      answer: 1,
      lesson: 'The `ls -l` command displays directory contents in long format, showing permissions, owner, size, and timestamp.',
      reward: 15
    },
    {
      id: 'lin-2',
      name: 'Chmod Permission',
      question: 'How do you change file permissions in Linux to make a script executable for the owner?',
      options: [
        'chmod +x file.sh',
        'chown +x file.sh',
        'chmod 777 file.sh',
        'chmod u+x file.sh'
      ],
      answer: 3,
      lesson: '`chmod u+x` specifically grants execution rights (+x) only to the owner (u) of the file.',
      reward: 15
    },
    {
      id: 'lin-3',
      name: 'System Monitor',
      question: 'Which command is used to view active, real-time system process statistics?',
      options: ['ps -ef', 'top', 'df -h', 'kill -9'],
      answer: 1,
      lesson: 'The `top` command provides a dynamic, real-time view of system processes, CPU, and memory utilization.',
      reward: 15
    },
    {
      id: 'lin-4',
      name: 'Symbolic Link',
      question: 'How do you create a symbolic link named "shortcut" pointing to "original.txt"?',
      options: [
        'ln original.txt shortcut',
        'ln -s original.txt shortcut',
        'link original.txt shortcut',
        'cp -s original.txt shortcut'
      ],
      answer: 1,
      lesson: '`ln -s` creates a soft/symbolic link, while omitting `-s` creates a hard link.',
      reward: 15
    },
    {
      id: 'lin-5',
      name: 'Pattern Search',
      question: 'Which utility searches for lines matching a specified pattern within files?',
      options: ['find', 'locate', 'grep', 'sed'],
      answer: 2,
      lesson: '`grep` (Global Regular Expression Print) searches plain-text data sets for lines matching a regular expression.',
      reward: 15
    }
  ],
  'Docker': [
    {
      id: 'doc-1',
      name: 'Image Construction',
      question: 'Which command compiles a Dockerfile into a usable Docker image?',
      options: ['docker run', 'docker build', 'docker create', 'docker commit'],
      answer: 1,
      lesson: '`docker build` reads the instructions in a Dockerfile to build a container image.',
      reward: 15
    },
    {
      id: 'doc-2',
      name: 'Container vs Image',
      question: 'What is the difference between a container and an image?',
      options: [
        'An image is a running instance of a container',
        'A container is a running instance of an image',
        'They are identical concepts',
        'Images run on servers, containers run locally'
      ],
      answer: 1,
      lesson: 'An image is a read-only template with instructions, whereas a container is a runnable, isolated instance of that image.',
      reward: 15
    },
    {
      id: 'doc-3',
      name: 'Detached Mode',
      question: 'How do you run a container in the background (detached mode) using Docker CLI?',
      options: ['docker run -b', 'docker run -d', 'docker run -bg', 'docker run -daemon'],
      answer: 1,
      lesson: 'The `-d` flag runs the container in detached mode, releasing control of the terminal window.',
      reward: 15
    },
    {
      id: 'doc-4',
      name: 'Listing Containers',
      question: 'Which command is used to view all currently active and stopped containers?',
      options: ['docker ps', 'docker ps -a', 'docker containers list', 'docker images'],
      answer: 1,
      lesson: '`docker ps -a` lists all containers, while `docker ps` only shows currently running ones.',
      reward: 15
    },
    {
      id: 'doc-5',
      name: 'Docker Volumes',
      question: 'What is a Docker volume primarily used for?',
      options: [
        'Increasing container network transfer speeds',
        "Persisting data outside of a container's lifecycle",
        'Restricting container CPU resource usage',
        'Encrypting compiler environments'
      ],
      answer: 1,
      lesson: "Volumes are the preferred mechanism for persisting data generated by and used by Docker containers, independent of the container's lifecycle.",
      reward: 15
    }
  ],
  'Kubernetes': [
    {
      id: 'k8s-1',
      name: 'Pod Concept',
      question: 'What is the smallest deployable object/unit of execution in Kubernetes?',
      options: ['Service', 'Pod', 'Deployment', 'Container'],
      answer: 1,
      lesson: 'A Pod represents a single instance of a running process in a cluster and is the smallest deployable unit in Kubernetes.',
      reward: 15
    },
    {
      id: 'k8s-2',
      name: 'K8s Service Role',
      question: 'What is the role of a Kubernetes Service?',
      options: [
        'To schedule pods across cluster nodes',
        'To expose a set of Pods as a network service with a stable IP',
        'To store persistent volume disks',
        'To compile container code'
      ],
      answer: 1,
      lesson: 'Services group a set of Pods and provide a stable network endpoint (IP and DNS) for accessing them.',
      reward: 15
    },
    {
      id: 'k8s-3',
      name: 'Listing Pods',
      question: 'Which command lists all pods inside the default namespace?',
      options: ['kubectl show pods', 'kubectl get pods', 'kubectl describe pods', 'kube list pods'],
      answer: 1,
      lesson: '`kubectl get pods` is the standard command to list pods in the active namespace.',
      reward: 15
    },
    {
      id: 'k8s-4',
      name: 'Deployments',
      question: 'What is a Deployment in Kubernetes?',
      options: [
        'A tool to build container images',
        'A resource that manages declarative state updates for Pods/ReplicaSets',
        'An isolated node group',
        'A physical hardware rack'
      ],
      answer: 1,
      lesson: 'A Deployment provides declarative updates for Pods and ReplicaSets, handling self-healing, rolling updates, and scaling.',
      reward: 15
    },
    {
      id: 'k8s-5',
      name: 'ConfigMap Usage',
      question: 'What is a ConfigMap used for?',
      options: [
        'Storing confidential database passwords',
        'Storing non-confidential key-value configuration data',
        'Routing external HTTP requests',
        'Managing physical network routers'
      ],
      answer: 1,
      lesson: 'ConfigMaps allow you to decouple environment-specific configurations from container images. Secrets should be used for sensitive/confidential data.',
      reward: 15
    }
  ],
  'AI': [
    {
      id: 'ai-1',
      name: 'Transformer Parallelization',
      question: 'What key mechanism allows Transformer models to process sequences in parallel?',
      options: ['Recurrent neural connections', 'Convolutional filters', 'Self-Attention mechanism', 'Max pooling layers'],
      answer: 2,
      lesson: 'The Self-Attention mechanism allows Transformers to model relationships between all tokens in a sequence simultaneously and in parallel.',
      reward: 15
    },
    {
      id: 'ai-2',
      name: 'Supervised vs Unsupervised',
      question: 'What is the main distinction between supervised and unsupervised learning?',
      options: [
        'Supervised learning requires labeled training data',
        'Unsupervised learning uses more layers',
        "Supervised learning doesn't use loss functions",
        'Unsupervised learning is only used for images'
      ],
      answer: 0,
      lesson: 'Supervised learning algorithms are trained on labeled data (input-output pairs), while unsupervised learning analyzes unlabeled data to find hidden patterns.',
      reward: 15
    },
    {
      id: 'ai-3',
      name: 'Overfitting',
      question: 'What is overfitting in machine learning?',
      options: [
        'The model fails to learn the training data patterns',
        'The model performs exceptionally well on training data but poorly on unseen test data',
        'The neural network runs out of VRAM memory',
        'The learning rate is too small'
      ],
      answer: 1,
      lesson: 'Overfitting occurs when a model learns the detail and noise in the training data to an extent that it negatively impacts its performance on new, unseen data.',
      reward: 15
    },
    {
      id: 'ai-4',
      name: 'LLM Temperature',
      question: 'What does the "temperature" parameter control in LLM text generation?',
      options: [
        'The CPU heat generated by the model running',
        'The randomness and creativity of the generated tokens',
        'The maximum number of tokens in the response',
        'The vocabulary dictionary size'
      ],
      answer: 1,
      lesson: 'Lower temperature values make the output more deterministic and focused, while higher values increase randomness and creativity.',
      reward: 15
    },
    {
      id: 'ai-5',
      name: 'Gradient Descent',
      question: 'What is the objective of Gradient Descent in neural network training?',
      options: [
        'To increase the learning rate over time',
        'To minimize the loss function by updating weights',
        'To initialize the random weight variables',
        'To prune unused neurons'
      ],
      answer: 1,
      lesson: 'Gradient Descent is an optimization algorithm used to minimize a loss function by iteratively moving in the direction of steepest descent.',
      reward: 15
    }
  ],
  'Web Development': [
    {
      id: 'web-1',
      name: 'CSS Box Model',
      question: 'In the CSS Box Model, which layer is immediately outside the padding area?',
      options: ['Margin', 'Border', 'Content', 'Outline'],
      answer: 1,
      lesson: 'The CSS box model layers from inside out are: Content -> Padding -> Border -> Margin.',
      reward: 15
    },
    {
      id: 'web-2',
      name: 'React Side Effects',
      question: 'How do you trigger side-effects in a React functional component?',
      options: ['useMemo', 'useState', 'useEffect', 'useCallback'],
      answer: 2,
      lesson: 'The `useEffect` hook lets you perform side effects (data fetching, subscriptions, DOM manipulation) in functional components.',
      reward: 15
    },
    {
      id: 'web-3',
      name: 'HTTP 403 Forbidden',
      question: 'What does HTTP Status Code 403 represent?',
      options: [
        'The server could not find the requested resource',
        'The client is unauthorized and needs to log in',
        'The client is authenticated but forbidden from accessing the resource',
        'The server encountered an unexpected internal error'
      ],
      answer: 2,
      lesson: '403 Forbidden means the server understands the request but refuses to authorize it, distinct from 401 Unauthorized (which means unauthenticated).',
      reward: 15
    },
    {
      id: 'web-4',
      name: 'Safe Rest Method',
      question: 'Which HTTP method is considered safe and idempotent under REST conventions?',
      options: ['POST', 'GET', 'PATCH', 'DELETE'],
      answer: 1,
      lesson: 'GET is a safe (read-only) and idempotent method, meaning repeated identical requests have the exact same effect and do not modify state.',
      reward: 15
    },
    {
      id: 'web-5',
      name: 'Session vs LocalStorage',
      question: 'How does sessionStorage differ from localStorage?',
      options: [
        'sessionStorage has double the storage capacity',
        'sessionStorage data is cleared when the browser tab or session ends',
        'sessionStorage is accessible across different browser windows',
        'sessionStorage data is stored on the server side'
      ],
      answer: 1,
      lesson: "sessionStorage maintains a storage area for each given origin that's available for the duration of the page session (as long as the tab is open).",
      reward: 15
    }
  ],
  'Databases': [
    {
      id: 'db-1',
      name: 'ACID Isolation',
      question: 'What does the "I" in ACID transactions stand for?',
      options: ['Integrity', 'Isolation', 'Indexability', 'Idempotency'],
      answer: 1,
      lesson: 'ACID stands for Atomicity, Consistency, Isolation, and Durability. Isolation ensures concurrent transactions do not interfere with each other.',
      reward: 15
    },
    {
      id: 'db-2',
      name: 'SQL Left Join',
      question: 'Which SQL JOIN returns all matching rows from both tables, plus unmatched rows from the left table?',
      options: ['INNER JOIN', 'RIGHT JOIN', 'LEFT JOIN', 'FULL OUTER JOIN'],
      answer: 2,
      lesson: 'A LEFT JOIN (or LEFT OUTER JOIN) returns all records from the left table, and matching records from the right table, filling right columns with NULL where there is no match.',
      reward: 15
    },
    {
      id: 'db-3',
      name: 'MongoDB Class',
      question: 'What type of database is MongoDB classified as?',
      options: ['Relational database', 'Document store NoSQL database', 'Graph database', 'Key-value cache database'],
      answer: 1,
      lesson: 'MongoDB is a document-oriented NoSQL database that stores data in flexible, JSON-like BSON documents.',
      reward: 15
    },
    {
      id: 'db-4',
      name: 'Index Purpose',
      question: 'What is the primary purpose of creating a database index?',
      options: [
        'To encrypt sensitive columns',
        'To speed up query and data retrieval operations',
        'To prevent duplicate records from being added',
        'To reduce the storage space of tables'
      ],
      answer: 1,
      lesson: 'Indexes are special lookup structures that allow the database engine to locate records much faster than performing a full table scan.',
      reward: 15
    },
    {
      id: 'db-5',
      name: 'Normalization 3NF',
      question: 'What is the main goal of database normalization (up to 3NF)?',
      options: [
        'To maximize disk space consumption',
        'To eliminate data redundancy and prevent update anomalies',
        'To merge as many tables together as possible',
        'To bypass SQL permission checks'
      ],
      answer: 1,
      lesson: 'Normalization organizes columns and tables to ensure dependencies are enforced correctly, minimizing data duplication and anomalies.',
      reward: 15
    }
  ],
  'Operating Systems': [
    {
      id: 'os-1',
      name: 'Virtual Memory',
      question: 'What is Virtual Memory primarily used for in modern operating systems?',
      options: [
        'Increasing CPU clock speeds',
        'Allowing processes to address more memory than is physically available',
        'Encrypting local storage files',
        'Caching network web requests'
      ],
      answer: 1,
      lesson: 'Virtual memory maps process-level memory addresses to physical RAM or secondary disk storage, allowing large programs to run seamlessly.',
      reward: 15
    },
    {
      id: 'os-2',
      name: 'Deadlock Conditions',
      question: 'Which of the following is NOT one of the Coffman conditions required for a deadlock to occur?',
      options: ['Mutual Exclusion', 'Hold and Wait', 'Preemption permitted', 'Circular Wait'],
      answer: 2,
      lesson: 'Deadlocks require "No Preemption" of resources already held; if preemption is permitted, deadlocks can be resolved/prevented.',
      reward: 15
    },
    {
      id: 'os-3',
      name: 'OS Privilege Modes',
      question: 'What is the main difference between User Mode and Kernel Mode?',
      options: [
        'Kernel mode has restricted CPU instruction execution capabilities',
        'User mode has direct access to hardware and physical memory',
        'Kernel mode has unrestricted, privileged access to hardware and core CPU instructions',
        'User mode is only used for command line terminals'
      ],
      answer: 2,
      lesson: 'Kernel Mode runs with full privileges, enabling direct hardware access. User Mode runs applications in a restricted sandbox to prevent system-wide crashes.',
      reward: 15
    },
    {
      id: 'os-4',
      name: 'Semaphore vs Mutex',
      question: 'How does a binary Semaphore differ from a Mutex?',
      options: [
        'Mutexes can be released by any thread, semaphores cannot',
        'Mutexes have an ownership concept (only the locking thread can unlock), semaphores do not',
        'Semaphores are always slower',
        'Mutexes can count up to infinity'
      ],
      answer: 1,
      lesson: 'A Mutex has a strict ownership constraint: only the thread that acquired the mutex can release it. A binary semaphore can be signaled by any thread/process.',
      reward: 15
    },
    {
      id: 'os-5',
      name: 'OS Thrashing',
      question: 'What is "thrashing" in an operating system context?',
      options: [
        'A CPU physical overheating protection mechanism',
        'A state where the OS spends more time swapping pages in/out of memory than executing code',
        'Deleting temporary log files automatically',
        'A multi-threaded priority inversion bug'
      ],
      answer: 1,
      lesson: 'Thrashing occurs when virtual memory resources are exhausted, causing the OS to spend excessive time swapping pages, stalling progress.',
      reward: 15
    }
  ],
  'Cybersecurity': [
    {
      id: 'sec-1',
      name: 'Asymmetric Cryptography',
      question: 'What is the main distinction of asymmetric encryption compared to symmetric encryption?',
      options: [
        'It uses the same key for both encryption and decryption',
        'It uses a pair of mathematically linked keys: a public key and a private key',
        'It is significantly faster to execute',
        'It does not require any keys at all'
      ],
      answer: 1,
      lesson: 'Asymmetric encryption (e.g., RSA, ECC) uses a public key to encrypt and a separate, private key to decrypt, ensuring secure key exchange.',
      reward: 15
    },
    {
      id: 'sec-2',
      name: 'SQL Injection Guard',
      question: 'What is the most effective way to prevent SQL Injection vulnerabilities?',
      options: [
        'Filtering out single-quote characters in the client browser',
        'Using parameterized queries or prepared statements',
        'Encrypting the database connection stream',
        'Sizing database tables smaller'
      ],
      answer: 1,
      lesson: 'Prepared statements/parameterized queries ensure that user inputs are treated strictly as parameters, never executable SQL command structures.',
      reward: 15
    },
    {
      id: 'sec-3',
      name: 'XSS Attack',
      question: 'What does a Cross-Site Scripting (XSS) attack involve?',
      options: [
        'Flooding a web server with invalid traffic',
        "Injecting malicious scripts into trusted websites to execute in another user's browser",
        'Bypassing firewall rules using spoofed IP addresses',
        'Stealing databases via unencrypted backups'
      ],
      answer: 1,
      lesson: 'XSS occurs when an application includes untrusted data in a web page without proper validation or escaping, letting attacker scripts run in client sessions.',
      reward: 15
    },
    {
      id: 'sec-4',
      name: 'MFA Factors',
      question: 'What are the three classic factors used in Multi-Factor Authentication (MFA)?',
      options: [
        'Who you are, what you look like, what you say',
        'Something you know, something you have, something you are',
        'Where you live, where you work, where you went',
        'IP address, browser cookies, screen resolution'
      ],
      answer: 1,
      lesson: 'MFA relies on combinations of: Knowledge (e.g., password), Possession (e.g., security token/phone), and Inherence (e.g., fingerprint/biometrics).',
      reward: 15
    },
    {
      id: 'sec-5',
      name: 'Phishing',
      question: 'What is Phishing?',
      options: [
        'A technique to sniff local Wi-Fi packets',
        'A social engineering attack designed to steal user credentials or data via deceptive messages',
        'An automated port scanning routine',
        'Bypassing password requirements via brute force'
      ],
      answer: 1,
      lesson: 'Phishing is a deceptive social engineering practice where attackers masquerade as trustworthy entities to trick users into revealing sensitive data.',
      reward: 15
    }
  ],
  'DevOps': [
    {
      id: 'dev-1',
      name: 'Continuous Integration',
      question: 'What is the primary benefit of Continuous Integration (CI)?',
      options: [
        'Deploying code directly to production servers instantly',
        'Integrating and testing changes frequently to catch integration bugs early',
        'Replacing human developers with automated coding engines',
        'Reducing the frequency of git commits'
      ],
      answer: 1,
      lesson: 'CI encourages developers to merge code changes into a central repository frequently, triggering automated builds and test runs to locate bugs quickly.',
      reward: 15
    },
    {
      id: 'dev-2',
      name: 'Infrastructure as Code',
      question: 'Which tool is widely used for Infrastructure as Code (IaC) to define cloud resources declaratively?',
      options: ['Jenkins', 'Terraform', 'Docker', 'Prometheus'],
      answer: 1,
      lesson: 'Terraform is an open-source IaC tool that lets you define cloud infrastructure (VMs, networks, storage) using a high-level configuration language.',
      reward: 15
    },
    {
      id: 'dev-3',
      name: 'Blue-Green Deployment',
      question: 'What characterizes a "Blue-Green" deployment strategy?',
      options: [
        'Deploying to a fraction of users first, then scaling up',
        'Maintaining two identical production environments (one active, one idle) to eliminate downtime',
        'Rewriting the server backend code entirely in Go or Rust',
        'Gradually updating servers in-place one by one'
      ],
      answer: 1,
      lesson: 'Blue-Green deployments minimize risk and downtime by maintaining two identical physical environments. Traffic is routed to the new version instantly by updating routers.',
      reward: 15
    },
    {
      id: 'dev-4',
      name: 'Observability',
      question: 'What does the term "Observability" in DevOps mean?',
      options: [
        'Watching developer screens during shifts',
        'The ability to measure the internal states of a system based on its external outputs (metrics, logs, traces)',
        'Making all code repositories public on GitHub',
        'Restricting server access to security auditors only'
      ],
      answer: 1,
      lesson: 'Observability relies on telemetry data (Metrics, Logs, Traces) to understand and troubleshoot complex microservices and distributed environments.',
      reward: 15
    },
    {
      id: 'dev-5',
      name: 'Webhooks',
      question: 'What is a Webhook?',
      options: [
        'An automated UI testing framework',
        'An HTTP callback handler that triggers real-time data push on specific events',
        'A physical ethernet security cable',
        'A tool to load-balance WebSocket connections'
      ],
      answer: 1,
      lesson: 'Webhooks are user-defined HTTP POST callbacks that allow applications to notify external services automatically when specific events occur.',
      reward: 15
    }
  ],
  'Cloud Computing': [
    {
      id: 'cld-1',
      name: 'Serverless Compute',
      question: 'What is "Serverless" computing?',
      options: [
        'Running applications without any physical hardware servers',
        'An execution model where the cloud provider manages server provisioning, scaling, and maintenance dynamically',
        'Hosting code exclusively inside browser local storage',
        'Using peer-to-peer computers instead of cloud networks'
      ],
      answer: 1,
      lesson: 'Serverless doesn\'t mean "no servers". It means developers don\'t have to lease, provision, scale, or manage virtual servers; the cloud vendor does it dynamically per request.',
      reward: 15
    },
    {
      id: 'cld-2',
      name: 'AWS S3 Category',
      question: 'What cloud storage category does AWS S3 fall under?',
      options: ['Block Storage', 'Relational database', 'Object Storage', 'File System Storage'],
      answer: 2,
      lesson: 'Simple Storage Service (S3) is an object storage service offering high scalability, data availability, security, and performance.',
      reward: 15
    },
    {
      id: 'cld-3',
      name: 'Service Level Agreement',
      question: 'What is a Service Level Agreement (SLA) in Cloud Computing?',
      options: [
        'A password policy guidelines document',
        'A contract defining the service availability, metrics, and financial penalties for uptime failures',
        'An encryption certificate protocol',
        'An automated server scaling rule'
      ],
      answer: 1,
      lesson: 'An SLA is a formal commitment between a service provider and a client specifying service standard targets, reliability guarantees, and remediation.',
      reward: 15
    },
    {
      id: 'cld-4',
      name: 'Edge Locations',
      question: 'What is the primary purpose of CDN Edge Locations?',
      options: [
        'To run heavy background database queries',
        'To serve static and dynamic content to end-users with low latency',
        'To archive cold backups of logs',
        'To host primary cloud control plane servers'
      ],
      answer: 1,
      lesson: 'Edge locations cache content closer to users geographically, reducing round-trip latency and network bandwidth usage.',
      reward: 15
    },
    {
      id: 'cld-5',
      name: 'Scaling Directions',
      question: 'What is the difference between horizontal and vertical scaling?',
      options: [
        'Horizontal scaling increases single instance RAM/CPU; Vertical adds more instances',
        'Horizontal scaling adds more servers; Vertical upgrades the resources of a single server',
        'They are completely synonymous terms',
        'Horizontal scaling is only used for databases, vertical for web servers'
      ],
      answer: 1,
      lesson: 'Horizontal scaling is "scaling out" (adding more nodes), while Vertical scaling is "scaling up" (upgrading CPU/RAM of an existing node).',
      reward: 15
    }
  ],
  'Career Preparation': [
    {
      id: 'car-1',
      name: 'STAR Response Method',
      question: 'What does the "STAR" method acronym represent for answering behavioral interview questions?',
      options: [
        'System, Task, Application, Review',
        'Situation, Task, Action, Result',
        'Skills, Teamwork, Aptitude, Recommendation',
        'Status, Timeline, Achievement, Report'
      ],
      answer: 1,
      lesson: 'STAR is a structured technique: describe the Situation, explain your assigned Task, detail your specific Action, and share the quantifiable Result.',
      reward: 15
    },
    {
      id: 'car-2',
      name: 'ATS Friendly Format',
      question: 'What is an ATS-friendly resume practice?',
      options: [
        'Using highly intricate, complex graphic layouts',
        'Integrating large image files and colorful icons',
        'Using clear text headings, standard fonts, and descriptive keywords matching job descriptions',
        'Avoiding listing numerical metrics or results'
      ],
      answer: 2,
      lesson: 'Applicant Tracking Systems (ATS) scan resumes for keywords and parse clean layouts. Use standard text formatting and include relevant tech keywords.',
      reward: 15
    },
    {
      id: 'car-3',
      name: 'Reverse Questioning',
      question: 'What is a recommended approach for "reverse questioning" at the end of a technical interview?',
      options: [
        'Asking the interviewer how much money they make',
        "Asking insightful questions about the team's engineering practices, tech stack, and roadmap challenges",
        'Remaining silent to show you are agreeable',
        'Asking if they can skip reference checks'
      ],
      answer: 1,
      lesson: 'Asking questions about the team structure, deployment frequencies, or technical hurdles shows active interest, professional maturity, and alignment.',
      reward: 15
    },
    {
      id: 'car-4',
      name: 'Elevator Pitch Length',
      question: 'What is the ideal length of a standard career Elevator Pitch?',
      options: ['30 to 60 seconds', '5 to 10 minutes', 'Exactly 5 seconds', 'Over an hour with slides'],
      answer: 0,
      lesson: 'An elevator pitch should be a concise, powerful introduction of your professional background, skills, and value proposition, matching typical brief encounters.',
      reward: 15
    },
    {
      id: 'car-5',
      name: 'GitHub Profile Builder',
      question: 'What is a key GitHub profile practice for a job-seeking software developer?',
      options: [
        'Pinning 50 repository forks with no READMEs',
        'A clear profile README with active pinned repos showing well-documented projects and clean code',
        'Hiding all commit graphs to keep code private',
        'Leaving repo descriptions entirely blank'
      ],
      answer: 1,
      lesson: 'Recruiters and engineers look for well-organized portfolios. A clear profile README and documented projects show structure, communication skill, and passion.',
      reward: 15
    }
  ],
  'Aptitude': [
    {
      id: 'apt-1',
      name: 'Train Speed and Distance',
      question: 'A train running at 54 km/hr crosses a standing pole in 20 seconds. What is the length of the train in meters?',
      options: ['150 meters', '300 meters', '270 meters', '180 meters'],
      answer: 1,
      lesson: 'Speed = 54 km/hr = 54 * (5/18) = 15 m/s. Distance (length) = Speed * Time = 15 m/s * 20 s = 300 meters.',
      reward: 15
    },
    {
      id: 'apt-2',
      name: 'Time and Work',
      question: 'A and B can do a work in 12 days, B and C in 15 days, and C and A in 20 days. If A, B and C work together, in how many days will they complete the work?',
      options: ['6 days', '10 days', '8 days', '12 days'],
      answer: 1,
      lesson: 'Rates: A+B = 1/12, B+C = 1/15, C+A = 1/20. Summing: 2(A+B+C) = 1/12 + 1/15 + 1/20 = 5/60 + 4/60 + 3/60 = 12/60 = 1/5. Thus, A+B+C rate = 1/10 per day, completing in 10 days.',
      reward: 15
    },
    {
      id: 'apt-3',
      name: 'Probability of Dice Sum',
      question: 'If you roll two standard six-sided dice, what is the probability that the sum of the numbers rolled is exactly 7?',
      options: ['1/6', '1/12', '5/36', '7/36'],
      answer: 0,
      lesson: 'There are 36 total outcomes. Outcomes summing to 7 are: (1,6), (2,5), (3,4), (4,3), (5,2), (6,1) -> 6 outcomes. Probability = 6/36 = 1/6.',
      reward: 15
    },
    {
      id: 'apt-4',
      name: 'Age Ratios',
      question: 'The ratio of ages of John and Mary is 4:5. Six years from now, the ratio of their ages will be 5:6. What is John\'s current age?',
      options: ['20', '24', '30', '18'],
      answer: 1,
      lesson: "Let John be 4x and Mary be 5x. (4x+6)/(5x+6) = 5/6 => 24x + 36 = 25x + 30 => x = 6. John's current age is 4 * 6 = 24.",
      reward: 15
    },
    {
      id: 'apt-5',
      name: 'Net Percentage Change',
      question: 'A product\'s price is reduced by 20%, and then increased by 25%. What is the net percentage change in the price?',
      options: ['0% change', '5% increase', '4% decrease', '2% increase'],
      answer: 0,
      lesson: 'Let initial price be 100. Reduced by 20% -> 80. Increased by 25% of 80 -> 80 + 20 = 100. Net change is 0%.',
      reward: 15
    }
  ],
  'System Design': [
    {
      id: 'sys-1',
      name: 'Load Balancer Role',
      question: 'What is the primary function of a Load Balancer?',
      options: [
        'To store database backups safely',
        'To distribute incoming network traffic across multiple servers',
        'To compile frontend code in production',
        'To compress images on the fly'
      ],
      answer: 1,
      lesson: 'A Load Balancer distributes workloads across a pool of servers, ensuring high availability, reliability, and scaling.',
      reward: 15
    },
    {
      id: 'sys-2',
      name: 'Database Sharding',
      question: 'What is Database Sharding?',
      options: [
        'Making exact replicas of tables for backup',
        'Horizontally partitioning a database to distribute data rows across multiple physical machines',
        'Converting SQL queries to NoSQL datasets',
        'Encrypting columns with specialized keys'
      ],
      answer: 1,
      lesson: 'Sharding partitions rows of a table across multiple database engines, boosting throughput and bypassing storage bounds on single instances.',
      reward: 15
    },
    {
      id: 'sys-3',
      name: 'API Gateway Role',
      question: 'What is the role of an API Gateway in a microservices architecture?',
      options: [
        'To compile separate microservices together',
        'To act as a single entry point that handles routing, authentication, and rate limiting',
        'To host primary DNS servers',
        'To store session cookies in a distributed cache'
      ],
      answer: 1,
      lesson: 'An API Gateway routes requests from clients to internal microservices, handling cross-cutting concerns like auth, SSL termination, and rate limiting.',
      reward: 15
    },
    {
      id: 'sys-4',
      name: 'LRU Cache Policy',
      question: 'What does the "Least Recently Used" (LRU) cache eviction policy do?',
      options: [
        'Discards the items that are largest in size first',
        'Discards the least recently accessed items first when cache is full',
        'Randomly deletes items to free up space',
        'Always deletes the oldest item created'
      ],
      answer: 1,
      lesson: 'An LRU cache ejects the least recently requested data items first when its capacity limit is reached, optimizing for temporal locality.',
      reward: 15
    },
    {
      id: 'sys-5',
      name: 'CDN Purpose',
      question: 'Why would you use a CDN (Content Delivery Network)?',
      options: [
        'To host primary relational database schemas',
        'To cache static and dynamic assets closer to users, improving load speed',
        'To securely run private terminal environments',
        'To run container builds in the cloud'
      ],
      answer: 1,
      lesson: 'A CDN caches web assets (HTML, JS, CSS, images) in globally distributed edge servers, drastically cutting response latency.',
      reward: 15
    }
  ]
};

// Helper function to generate a daily challenge
export function generateDailyChallenge(dateSeed: string): QuizQuestion[] {
  // Use a stable custom random function seeded by date string so it is deterministic or randomized
  // We want to select:
  // - 3 to 5 categories randomly (let's say 4 categories)
  // - 3 questions from each selected category (total of 12 questions)
  // Let's implement a deterministic PRNG based on dateSeed (e.g., YYYY-MM-DD)
  let seed = 0;
  for (let i = 0; i < dateSeed.length; i++) {
    seed += dateSeed.charCodeAt(i);
  }

  function random(): number {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
  }

  function shuffle<T>(arr: T[]): T[] {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  // Shuffle categories
  const shuffledCats = shuffle(QUIZ_CATEGORIES);
  // Pick between 3 and 5 categories (let's say we pick 4 categories)
  const categoryCount = 3 + Math.floor(random() * 3); // 3, 4, or 5
  const selectedCats = shuffledCats.slice(0, categoryCount);

  const challengeQuestions: QuizQuestion[] = [];

  selectedCats.forEach(cat => {
    const questionsInCat = quizBank[cat] || [];
    const shuffledQuestions = shuffle(questionsInCat);
    // Pick between 3 and 5 questions from each category
    const questionCount = 3 + Math.floor(random() * 3); // 3, 4, or 5
    const pickedQuestions = shuffledQuestions.slice(0, Math.min(questionCount, questionsInCat.length));

    pickedQuestions.forEach(q => {
      challengeQuestions.push({
        ...q,
        category: cat
      });
    });
  });

  return challengeQuestions;
}
