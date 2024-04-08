<h1><picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://i.imgur.com/NMaJcsy.png">
  <source media="(prefers-color-scheme: light)" srcset="https://i.imgur.com/BthpMZh.png">
  <img alt="Codetierlist" src="https://i.imgur.com/BthpMZh.png" height="34">
</picture></h1>

<a href="https://codeclimate.com/repos/65c59dd3da642979ffce97af/maintainability"><img src="https://api.codeclimate.com/v1/badges/91584b095b8e1ad9a134/maintainability" /></a> [![.github/workflows/proddeploy.yml](https://github.com/codetierlist/codetierlist/actions/workflows/proddeploy.yml/badge.svg)](https://github.com/codetierlist/codetierlist/actions/workflows/proddeploy.yml) [![.github/workflows/prod2deploy.yml](https://github.com/codetierlist/codetierlist/actions/workflows/prod2deploy.yml/badge.svg)](https://github.com/codetierlist/codetierlist/actions/workflows/prod2deploy.yml)

Ever wondered when you complete an assignment and do not know how well you're
doing compared to other students? Introducing Codetierlist!

We provide students an opportunity as the leading place to test
their code, to know their progress compared to their peers while they
are working on their assignments, making coding more **interactive**, **fun**,
and **easier**.

On Codetierlist, instructors can create new projects (assignments) for students.
In each project, students are able to upload their own test cases and code. How
well students do will be based on the accuracy of the students code in their
own test cases, this will be shown in a tier list for students to see.

## 😋 Features

1. **🔒 Login features**: Students and instructors can login to their accounts to access their respective features.
2. **🥇 Tierlist with real time updates**: Continuously updating the accuracy of each students code and repositioning them
3. **🤫 Safety and Independent working**: While students do provide their test cases and code to rank their progress, specific
   implementation details are never shown to other students. This is done to ensures students work independently, and to prevent
   [Academic Offenses](https://www.utm.utoronto.ca/academic-integrity/students/sanctions).
4. **📚 Timeline of submissions**: student submissions are stored using [git](https://git-scm.com/) and commit history is viewable

## 👟 Running Codetierlist

Codetierlist is a web application that is run using [Docker](https://www.docker.com/). To run Codetierlist, you
will need to have Docker installed on your machine.

For increased horizontal scalability, Codetierlist uses a job runner to handle the processing of student submissions.
This job runner can be run on a separate machine from the main Codetierlist application, and there can be multiple
job runners connected to the main Codetierlist application.

At least one job runner must be running for Codetierlist to function properly. Otherwise, uploads will not be
processed. Furthermore, the main Codetierlist application must be running for the job runner to connect to it.

The job runner must also have access to the Redis server that the main Codetierlist application is using, along
with the corresponding Redis password.

Typically, production services are handled via GitHub Actions CI/CD. This following section is to run Codetierlist
locally on your own system.

### 📦 Prerequisites

- [Docker](https://www.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/)
- [Make](https://www.gnu.org/software/make/)
- [Node.js](https://nodejs.org/en/) (for development)

### 💼 Local Development

To start the run the containers needed to run Codetierlist, run the following command in the root directory of the project:

```bash
make docker_up_dev # starts core services
make runner_up     # starts the job runner (does not have to be the same machine as above command)
```

To tear down the docker containers when finished with development, run:

```bash
make docker_down_dev # stops core services
make runner_down     # stops the job runner (does not have to be the same machine as above command)
```

After running the docker containers, go to http://localhost:3555/ to visit the site.

#### 🚢 Dev containers

Dev containers are available for use with [Visual Studio Code](https://code.visualstudio.com/) or
the [JetBrains](https://www.jetbrains.com/) suite of IDEs. These containers are pre-configured with the
necessary tools to run Codetierlist locally for development of the frontend or backend.

### 🚀 Production Deployment

To start the run the containers needed to run Codetierlist, clone the repository onto the machine you want to run Codetierlist on.

Then, run the following command in the root directory of the project:

```bash
make docker_up  # starts core services
make runner_up  # starts the job runner (does not have to be the same machine as above command)
```

To tear down the docker containers, run:

```bash
make docker_down  # stops core services
make runner_down  # stops the job runner (does not have to be the same machine as above command)
```

After running the docker containers, go to http://localhost:3555/ to visit the site.

## 📚 Simplified System Architecture

![System architecture](https://i.imgur.com/4mcN2Su.png)

## 💪 Contributing

Codetierlist is **free and open-source software** licensed under the
[LGPL-3.0 License](https://www.gnu.org/licenses/lgpl-3.0.en.html).

You can open issues for bugs you've found or features you think are missing.
You can also submit pull requests to this repository.

### ⚖️ License

LGPL-3.0 License © 2023 Codetierlist Contributors
