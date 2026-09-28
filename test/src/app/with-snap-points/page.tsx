import { useState } from 'react';
import { Drawer } from 'vaul-responsive';

const snapPoints = ['148px', '355px', 1];

export default function Page() {
  const [snap, setSnap] = useState<number | string | null>(snapPoints[0]);

  const activeSnapPointIndex = snapPoints.indexOf(snap as string);

  return (
    <div>
      <div data-testid="active-snap-index">{activeSnapPointIndex}</div>
      <Drawer.Root snapPoints={snapPoints} activeSnapPoint={snap} setActiveSnapPoint={setSnap}>
        <Drawer.Trigger asChild>
          <button data-testid="trigger">Open Drawer</button>
        </Drawer.Trigger>
        <Drawer.Overlay />
        <Drawer.Portal>
          <Drawer.Content data-testid="content">
            <div>
              <div>
                <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path
                    fillRule="evenodd"
                    d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z"
                    clipRule="evenodd"
                  ></path>
                </svg>
                <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path
                    fillRule="evenodd"
                    d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z"
                    clipRule="evenodd"
                  ></path>
                </svg>
                <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path
                    fillRule="evenodd"
                    d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z"
                    clipRule="evenodd"
                  ></path>
                </svg>
                <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path
                    fillRule="evenodd"
                    d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z"
                    clipRule="evenodd"
                  ></path>
                </svg>
                <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path
                    fillRule="evenodd"
                    d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z"
                    clipRule="evenodd"
                  ></path>
                </svg>
              </div>{' '}
              <h1>The Hidden Details</h1>
              <p>2 modules, 27 hours of video</p>
              <p>
                The world of user interface design is an intricate landscape filled with hidden details and nuance. In
                this course, you will learn something cool. To the untrained eye, a beautifully designed UI.
              </p>
              <button>Buy for $199</button>
              <div>
                <h2>Module 01. The Details</h2>
                <div>
                  <div>
                    <span>Layers of UI</span>
                    <span>A basic introduction to Layers of Design.</span>
                  </div>
                  <div>
                    <span>Typography</span>
                    <span>The fundamentals of type.</span>
                  </div>
                  <div>
                    <span>UI Animations</span>
                    <span>Going through the right easings and durations.</span>
                  </div>
                </div>
              </div>
              <div>
                <figure>
                  <blockquote>
                    “I especially loved the hidden details video. That was so useful, learned a lot by just reading it.
                    Can&rsquo;t wait for more course content!”
                  </blockquote>
                  <figcaption>
                    <span>Yvonne Ray, Frontend Developer</span>
                  </figcaption>
                </figure>
              </div>
              <div>
                <h2>Module 02. The Process</h2>
                <div>
                  <div>
                    <span>Build</span>
                    <span>Create cool components to practice.</span>
                  </div>
                  <div>
                    <span>User Insight</span>
                    <span>Find out what users think and fine-tune.</span>
                  </div>
                  <div>
                    <span>Putting it all together</span>
                    <span>Let&apos;s build an app together and apply everything.</span>
                  </div>
                </div>
              </div>
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    </div>
  );
}
