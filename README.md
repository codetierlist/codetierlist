<h1>
<picture>
  <img alt="Code Tier List" src="https://i.imgur.com/IJ0aAfV.png" height="25">
</picture>
Codetierlist
</h1>

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

<picture>
  <img alt="Code Tier List Demo" src="https://i.imgur.com/YmxU3dD.gif" height="">
</picture>


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

For frontend, you'll need a .env.local file:
```
NEXT_PUBLIC_API_URI=http://localhost:3555/api
```

To install dependencies and generate the prisma schema, run:
```
make
```

To start the run the frontend, backend, and database docker containers, run:
```
make docker_up
```

To tear down the frontend, backend, and database docker containers when finished with development, run:
```
make docker_down
```

After running the docker containers, go to http://localhost:3555/ to visit the site.


## 🚀 Deployment

### Tech stack:
* Frontend
    * [Fluent UI](https://fluent2.microsoft.design/) 🌊
    * [Next.js](https://nextjs.org/) 🖖
* Backend
    * [Express.js](https://expressjs.com/) 🚂
    * [Docker](https://www.docker.com/) 🐳
* Database, ORM, and data storage
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
