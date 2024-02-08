<h1><picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://i.imgur.com/NMaJcsy.png">
  <source media="(prefers-color-scheme: light)" srcset="https://i.imgur.com/BthpMZh.png">
  <img alt="Codetierlist" src="https://i.imgur.com/BthpMZh.png" height="34">
</picture></h1>

Ever wondered when you complete an assignment and do not know how well you're
doing compared to other students? Introducing the Codetierlist!

We provide to give users(students) an opportunity as the leading place to test
your code for students to know their progress compared to their peers while they
are working on their assignments, making coding more **interactive**, **fun**,
and **easier**.

On Codetierlist, instructors can create new projects (assignments) for students.
In each project, students are able to upload their own test cases and code, how
 well students do will be based on the accuracy of the students code in their
 own test cases, this will be shown in a tier list for students to see.

Follow along below to ✨**learn more**✨:

## [Demo Video](https://www.youtube.com/watch?v=pgzzxjJiDTQ)

## 🗺️ [Then, try out our project!](https://codetierlist.utm.utoronto.ca/)

## 😋 Features

### 🔒 Login features
For each course, only students enrolled are able to have access to the courses
Codetierlist.

### 🥇 Tierlist with real time updates
Continuously updating the accuracy of each students code and repositioning them
in the tier list.

### 🧑‍💻 Straightforward REST API
Allows for user addition of multiple files.

### 🤫 Safety and Independent working
While students do provide their test cases and code to rank their progress, these
will not be shown to other students. This is done to ensures students work
independently, and to prevent [Academic Offenses](https://www.utm.utoronto.ca/academic-integrity/students/sanctions).

## 💼 Local Development

### Running Locally
To start the run the containers needed to run Codetierlist, run the following command in the root directory of the project:
```bash
make docker_up_dev
```

To tear down the docker containers when finished with development, run:
```bash
make docker_down_dev
```

After running the docker containers, go to http://localhost:3555/ to visit the site.


## 🚀 Production Deployment
Production is handled via GitHub actions CI/CD.

### Running Locally
To start the run the containers needed to run Codetierlist, run the following command in the root directory of the project:
```bash
make docker_up
```

To tear down the docker containers, run:
```bash
make docker_down
```
After running the docker containers, go to http://localhost:3555/ to visit the site.


### Tech stack:
* Frontend
    * [Fluent UI](https://fluent2.microsoft.design/) 🌊
    * [Next.js](https://nextjs.org/) 🖖
* Backend
    * [Express.js](https://expressjs.com/) 🚂
    * [Docker](https://www.docker.com/) 🐳
* Database, ORM, and data storage
    * [Redis](https://redis.io/) 🍎
    * [Postgres](https://www.postgresql.org/) 🐘
    * [Prisma](https://www.prisma.io/) 🦄
    * [Isomorphic-git](https://github.com/isomorphic-git/isomorphic-git) 🐙

## 💪 Contributing

Codetierlist is **free and open-source software** licensed under the
[LGPL-3.0 License](https://www.gnu.org/licenses/lgpl-3.0.en.html)

You can open issues for bugs you've found or features you think are missing.
You can also submit pull requests to this repository.

## ⚖️ License
LGPL-3.0 License © 2023 Codetierlist Contributors
