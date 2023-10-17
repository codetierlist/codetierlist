"use client"

import Image from 'next/image'
import styles from './page.module.css'
import { Metadata } from 'next'
import {
  Button
} from "@fluentui/react-components";

export function generateMetadata() : Metadata {
  return {
    title: "Dakshboard"
  }
}

export default function Home() {
  return (
    <main className={styles.main}>
      <Button appearance="primary">Hello Fluent UI React</Button>
    </main>
  )
}
