import Link from 'next/link'
import React from 'react'
import { Image } from 'react-bootstrap'

const Logo = ({ width = 130 }) => {
  return (
    <Link href={'/'}>
      <Image src='/logo/logo.png' width={width} alt='logo' />
    </Link>
  )
}

export default Logo
