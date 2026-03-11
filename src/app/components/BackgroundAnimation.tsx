import { motion } from 'motion/react';

export function BackgroundAnimation() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
      <motion.div
        className="absolute w-[600px] h-[600px] rounded-full blur-[150px] opacity-30"
        style={{
          background: 'radial-gradient(circle, #E5E1DE 0%, #D5D1CE 100%)',
        }}
        animate={{
          x: ['-10%', '60%', '-10%'],
          y: ['20%', '70%', '20%'],
        }}
        transition={{
          duration: 40,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      <motion.div
        className="absolute w-[500px] h-[500px] rounded-full blur-[120px] opacity-25"
        style={{
          background: 'radial-gradient(circle, #D5D1CE 0%, #C5C1BE 100%)',
        }}
        animate={{
          x: ['70%', '10%', '70%'],
          y: ['60%', '10%', '60%'],
        }}
        transition={{
          duration: 35,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      <motion.div
        className="absolute w-[400px] h-[400px] rounded-full blur-[100px] opacity-20"
        style={{
          background: 'radial-gradient(circle, #C5C1BE 0%, #B5B1AE 100%)',
        }}
        animate={{
          x: ['40%', '80%', '40%'],
          y: ['80%', '30%', '80%'],
        }}
        transition={{
          duration: 45,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    </div>
  );
}
