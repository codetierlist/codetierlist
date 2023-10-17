"use client"

import Image from 'next/image'
import styles from './page.module.css'
import { Metadata } from 'next'
import {
  Button
} from "@fluentui/react-components";
import { Course, getCourses } from '../contexts/UserContext';
import { CourseOverviewCard } from '@/components';

export function generateMetadata() : Metadata {
  return {
    title: "Dakshboard"
  }
}

export default function Home() {
  const courses = getCourses();

  return (
    <main className={styles.main}>
      <div className="flex-wrap">
        {courses.map((course: Course, i) => {
          return (
            <CourseOverviewCard
              name={course.code}
              description={course.name}
              image="https://developer.mozilla.org/mdn-social-share.cd6c4a5a.png"
              session={course.session}
              key={i}
            />
          )
        })}
      </div>
    </main>
  )
}
