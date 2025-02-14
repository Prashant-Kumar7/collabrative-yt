"use client"

import { useRef } from "react"
import {Link} from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Play, Upload, Users, Layers, Check } from "lucide-react"

export default function Home() {
  const featuresRef = useRef<HTMLElement>(null)
  const howItWorksRef = useRef<HTMLElement>(null)
  const pricingRef = useRef<HTMLElement>(null)

  const scrollToSection = (ref: React.RefObject<HTMLElement>) => {
    ref.current?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <div className="flex flex-col w-screen min-h-screen">
      <header className="w-full py-4 px-4 sm:px-6 lg:px-8 bg-white border-b fixed top-0 z-10">
        <div className="container mx-auto flex justify-between items-center">
          <Link to="/" className="flex items-center space-x-2">
            <Play className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">WatchParty</span>
          </Link>
          <nav className="hidden md:flex space-x-4">
            <button
              onClick={() => scrollToSection(featuresRef)}
              className="text-sm font-medium text-gray-600 hover:text-gray-900 border-0 focus:outline-none"
            >
              Features
            </button>
            <button
              onClick={() => scrollToSection(howItWorksRef)}
              className="text-sm border-0 focus:outline-none font-medium text-gray-600 hover:text-gray-900"
            >
              How It Works
            </button>
            <button
              onClick={() => scrollToSection(pricingRef)}
              className="text-sm font-medium text-gray-600 border-0 focus:outline-none hover:text-gray-900"
            >
              Pricing
            </button>
          </nav>
          <div className="flex items-center space-x-2">
            <Link to={"auth/signin"}>
              <Button variant="outline">Sign In</Button>
            </Link>
            <Link to={"auth/signup"}>
              <Button>Sign Up</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-grow pt-16">
        <section className="py-20 bg-gradient-to-r from-purple-500 to-indigo-600 text-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-6">
                Create Watch Parties and Share Videos Like Never Before
              </h1>
              <p className="text-xl mb-8">
                Upload, transcode, and watch videos together with friends in real-time. Experience seamless video
                sharing across all devices.
              </p>
              <Button size="lg" className="mr-4">
                Get Started
              </Button>
              <Button className="text-black" size="lg" variant="outline">
                Learn More
              </Button>
            </div>
          </div>
        </section>

        <section ref={featuresRef} className="py-20 bg-gray-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <Users className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">Watch Parties</h3>
                <p className="text-gray-600">
                  Create and join watch parties with friends. Sync video playback and chat in real-time.
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <Upload className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">Easy Upload</h3>
                <p className="text-gray-600">
                  Quickly upload your videos and share them with your watch party or the world.
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <Layers className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">Auto Transcoding</h3>
                <p className="text-gray-600">
                  Your videos are automatically transcoded into multiple resolutions for optimal viewing on any device.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section ref={howItWorksRef} className="py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
            <div className="max-w-3xl mx-auto">
              <ol className="relative border-l border-gray-200">
                <li className="mb-10 ml-6">
                  <span className="absolute flex items-center justify-center w-8 h-8 bg-primary rounded-full -left-4 ring-4 ring-white">
                    1
                  </span>
                  <h3 className="font-semibold text-lg mb-1">Upload Your Video</h3>
                  <p className="text-base text-gray-600">
                    Simply drag and drop your video file or select it from your device. Our platform supports a wide
                    range of video formats.
                  </p>
                </li>
                <li className="mb-10 ml-6">
                  <span className="absolute flex items-center justify-center w-8 h-8 bg-primary rounded-full -left-4 ring-4 ring-white">
                    2
                  </span>
                  <h3 className="font-semibold text-lg mb-1">Create a Watch Party</h3>
                  <p className="text-base text-gray-600">
                    Set up your watch party by giving it a name and inviting your friends. You can also make it public
                    for anyone to join.
                  </p>
                </li>
                <li className="mb-10 ml-6">
                  <span className="absolute flex items-center justify-center w-8 h-8 bg-primary rounded-full -left-4 ring-4 ring-white">
                    3
                  </span>
                  <h3 className="font-semibold text-lg mb-1">Enjoy Together</h3>
                  <p className="text-base text-gray-600">
                    Start the video and chat with your friends in real-time. Our synchronized playback ensures
                    everyone's watching the same moment.
                  </p>
                </li>
              </ol>
            </div>
          </div>
        </section>

        <section ref={pricingRef} className="py-20 bg-gray-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-12">Pricing Plans</h2>
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <div className="bg-white p-8 rounded-lg shadow-md">
                <h3 className="text-2xl font-semibold mb-4">Basic</h3>
                <p className="text-4xl font-bold mb-6">
                  $0<span className="text-base font-normal">/month</span>
                </p>
                <ul className="mb-6 space-y-2">
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-2" /> 5 watch parties/month
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-2" /> 720p max resolution
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-2" /> 2GB storage
                  </li>
                </ul>
                <Button className="w-full">Get Started</Button>
              </div>
              <div className="bg-white p-8 rounded-lg shadow-md border-2 border-primary">
                <h3 className="text-2xl font-semibold mb-4">Pro</h3>
                <p className="text-4xl font-bold mb-6">
                  $9.99<span className="text-base font-normal">/month</span>
                </p>
                <ul className="mb-6 space-y-2">
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-2" /> Unlimited watch parties
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-2" /> 1080p max resolution
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-2" /> 50GB storage
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-2" /> Ad-free experience
                  </li>
                </ul>
                <Button className="w-full">Subscribe</Button>
              </div>
              <div className="bg-white p-8 rounded-lg shadow-md">
                <h3 className="text-2xl font-semibold mb-4">Business</h3>
                <p className="text-4xl font-bold mb-6">
                  $29.99<span className="text-base font-normal">/month</span>
                </p>
                <ul className="mb-6 space-y-2">
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-2" /> Unlimited watch parties
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-2" /> 4K max resolution
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-2" /> 500GB storage
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-2" /> Priority support
                  </li>
                </ul>
                <Button className="w-full">Contact Sales</Button>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-6">Ready to Start Your Watch Party?</h2>
              <p className="text-xl mb-8">Join thousands of users who are already enjoying shared video experiences.</p>
              <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                <Input type="email" placeholder="Enter your email" className="max-w-xs" />
                <Button size="lg">Create Account</Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <Link to="/" className="flex items-center space-x-2">
                <Play className="h-6 w-6" />
                <span className="text-xl font-bold">WatchParty</span>
              </Link>
            </div>
            <nav className="flex flex-wrap justify-center space-x-4">
              <Link to="#" className="hover:text-gray-300">
                About
              </Link>
              <Link to="#" className="hover:text-gray-300">
                Privacy
              </Link>
              <Link to="#" className="hover:text-gray-300">
                Terms
              </Link>
              <Link to="#" className="hover:text-gray-300">
                Contact
              </Link>
            </nav>
          </div>
          <div className="mt-8 text-center text-sm">© {new Date().getFullYear()} WatchParty. All rights reserved.</div>
        </div>
      </footer>
    </div>
  )
}

