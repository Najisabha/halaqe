import { useState, useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Scissors, Brush, Sparkles, Calendar, Star, MapPin } from "lucide-react";

// Optimized: Barber-themed background images
const backgroundImages = {
  hero: "https://cdn.prod.website-files.com/62921128232ba17acf7b6871/66e8aeaaa04208e36662b249_6668dafb7d213d9de5bbe5b0_pexels-marvin-sacdalan-276316567-13138476.webp",
  features: "https://images.unsplash.com/photo-1610873163627-3327e4d8d64e?auto=format&fit=crop&q=80&w=1920",
  testimonials: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1920",
  cta: "https://images.unsplash.com/photo-1595475207227-11b799505244?auto=format&fit=crop&q=80&w=1920",
};

// Feature images
const featureImages = {
  barbers: "https://neighborhoodcutandshave.com/wp-content/uploads/obi-pixel6propix-sRVfY0f2d8-unsplash-770x1024.jpg",
  salons: "https://t4.ftcdn.net/jpg/03/53/88/13/360_F_353881376_AlnBd9a08rm8cOWaXcYk7NlCols1V4jW.jpg",
  booking: "https://img.freepik.com/free-vector/appointment-booking-with-calendar_23-2148553008.jpg",
};

// Testimonial avatars
const testimonialAvatars = [
  "https://images.squarespace-cdn.com/content/v1/6270536f27fa2a2db87d05c3/8f8426b3-15b4-4903-ab0e-3b150b93841d/textured+crop.jpeg",
  "https://cdn.shopify.com/s/files/1/0022/0620/3948/files/unnamed_40.jpg?v=1724681462",
  "https://www.gatsbyglobal.com/en/technique/best-haircuts-men-top-mens-hairstyles-today/images/img1.jpg",
];

// CSS for animated background
const styles = `
  @keyframes bgZoom {
    0% { transform: scale(1); }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); }
  }
  .bg-barber-animated {
    animation: bgZoom 10s ease-in-out infinite;
    background-size: cover;
    background-position: center;
    will-change: transform;
  }
  @media (prefers-reduced-motion) {
    .bg-barber-animated { animation: none; }
  }
`;

const WelcomePage = () => {
  const [isHovered, setIsHovered] = useState(false);
  const [activeFeature, setActiveFeature] = useState(null);
  const [scrollY, setScrollY] = useState(0);
  const shouldReduceMotion = useReducedMotion();

  // Parallax effect
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Global stagger for section chaining
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  // Section variants with subtle parallax
  const sectionVariants = {
    hidden: { opacity: 0, y: 15, scale: 0.99 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.4, ease: "easeOut", type: "spring", stiffness: 120, damping: 20 },
    },
  };

  // Hero text animation
  const heroTextVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
  };

  // Scissors animation
  const scissorsVariants = shouldReduceMotion
    ? { initial: { rotate: 0 } }
    : {
        initial: { rotate: 0 },
        animate: { rotate: [0, 10, -10, 0], transition: { repeat: Infinity, duration: 2.5, ease: "easeInOut" } },
      };

  // Brush animation
  const brushVariants = shouldReduceMotion
    ? { initial: { y: 0 } }
    : {
        initial: { y: 0 },
        animate: { y: [-3, 3, -3], transition: { repeat: Infinity, duration: 1.8, ease: "easeInOut" } },
      };

  // Sparkles animation
  const sparklesVariants = shouldReduceMotion
    ? { initial: { scale: 1, opacity: 1 } }
    : {
        initial: { scale: 0, opacity: 0 },
        animate: { scale: [0, 0.7, 0], opacity: [0, 0.6, 0], transition: { repeat: Infinity, duration: 1.2, delay: Math.random() * 0.3 } },
      };

  // Button animation
  const buttonVariants = {
    initial: { scale: 1, boxShadow: "0 2px 6px rgba(0,0,0,0.15)" },
    hover: { scale: 1.03, boxShadow: "0 4px 10px rgba(0,0,0,0.25)", transition: { duration: 0.1 } },
    tap: { scale: 0.97 },
  };

  // Feature card animation
  const featureVariants = {
    hidden: { opacity: 0, y: 8 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.25, ease: "easeOut" } },
    hover: { scale: 1.02, boxShadow: "0 2px 6px rgba(255,255,255,0.2)", transition: { duration: 0.1 } },
  };

  // Scroll to section
  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      window.scrollTo({ top: element.getBoundingClientRect().top + window.pageYOffset - 80, behavior: "smooth" });
    }
  };

  return (
    <>
      <style>{styles}</style>
      <motion.div
        className="min-h-screen font-sans antialiased bg-gray-900"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Hero Section */}
        <motion.section
          id="hero"
          variants={sectionVariants}
          className="relative h-screen flex items-center justify-center bg-barber-animated"
          style={{ backgroundImage: `url(${backgroundImages.hero})`, backgroundPositionY: `${scrollY * 0.2}px` }}
          role="region"
          aria-label="Hero Section"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 to-black/30"></div>
          <div className="relative z-10 text-center text-white px-4 sm:px-6 max-w-5xl mx-auto">
            <motion.div className="absolute top-10 left-4 sm:left-12 lg:left-20" variants={scissorsVariants} initial="initial" animate="animate">
              <Scissors className="w-8 h-8 sm:w-10 sm:h-10 text-indigo-300 drop-shadow-md" />
            </motion.div>
            <motion.div className="absolute top-14 right-4 sm:right-12 lg:right-20" variants={brushVariants} initial="initial" animate="animate">
              <Brush className="w-8 h-8 sm:w-10 sm:h-10 text-slate-300 drop-shadow-md" />
            </motion.div>
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute"
                style={{ top: `${Math.random() * 50 + 20}%`, left: `${Math.random() * 50 + 25}%` }}
                variants={sparklesVariants}
                initial="initial"
                animate="animate"
              >
                <Sparkles className="w-3 h-3 text-indigo-200 opacity-50" />
              </motion.div>
            ))}
            <motion.h1
              className="text-4xl sm:text-5xl lg:text-7xl font-extrabold mb-4 sm:mb-6 tracking-tight leading-tight drop-shadow-lg"
              variants={heroTextVariants}
              initial="hidden"
              animate="visible"
            >
              Halaqe
            </motion.h1>
            <motion.p
              className="text-lg sm:text-xl lg:text-2xl mb-8 sm:mb-10 font-light max-w-3xl mx-auto text-gray-100"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.4 }}
            >
              Book your perfect barber cut across top salons with ease!
            </motion.p>
            <motion.button
              className="px-6 py-3 sm:px-8 sm:py-4 bg-gradient-to-r from-indigo-400 to-slate-500 text-white text-lg sm:text-xl font-semibold rounded-full shadow-lg"
              variants={buttonVariants}
              initial="initial"
              whileHover="hover"
              whileTap="tap"
              onClick={() => scrollToSection("features")}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              aria-label="Start Booking Now"
            >
              Start Booking
              <AnimatePresence>
                {isHovered && (
                  <motion.span
                    className="inline-block ml-2"
                    initial={{ x: -5, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: 5, opacity: 0 }}
                    transition={{ duration: 0.1 }}
                  >
                    ✂️
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </motion.section>

        {/* Features Section */}
        <motion.section
          id="features"
          variants={sectionVariants}
          className="py-20 px-4 sm:px-6 lg:px-16 container mx-auto bg-barber-animated relative"
          style={{ backgroundImage: `url(${backgroundImages.features})`, backgroundPositionY: `${scrollY * 0.15}px` }}
          role="region"
          aria-label="Features Section"
        >
          <div className="absolute inset-0 bg-gray-900/75"></div>
          <motion.h2
            className="relative text-3xl sm:text-4xl lg:text-5xl font-bold text-center text-white mb-12 sm:mb-16 drop-shadow-md"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3 }}
          >
            Why Halaqe?
          </motion.h2>
          <div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {[
              {
                title: "Top Barbers",
                description: "Discover skilled barbers for the perfect cut.",
                icon: <Scissors className="w-10 h-10 sm:w-12 sm:h-12 text-indigo-300" />,
                image: featureImages.barbers,
              },
              {
                title: "Multiple Salons",
                description: "Choose from premium barber shops near you.",
                icon: <MapPin className="w-10 h-10 sm:w-12 sm:h-12 text-slate-300" />,
                image: featureImages.salons,
              },
              {
                title: "Seamless Booking",
                description: "Book effortlessly anytime, anywhere.",
                icon: <Calendar className="w-10 h-10 sm:w-12 sm:h-12 text-indigo-300" />,
                image: featureImages.booking,
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                className="relative bg-white/10 backdrop-blur-lg rounded-xl p-6 text-center text-white border border-white/15 shadow-md overflow-hidden"
                variants={featureVariants}
                initial="hidden"
                whileInView="visible"
                whileHover="hover"
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                onMouseEnter={() => setActiveFeature(index)}
                onMouseLeave={() => setActiveFeature(null)}
                role="article"
                aria-label={feature.title}
              >
                <img
                  src={feature.image}
                  alt={feature.title}
                  className="w-full h-32 object-cover rounded-lg mb-4 opacity-90"
                  loading="lazy"
                />
                <motion.div
                  className="mb-4"
                  animate={activeFeature === index ? { scale: 1.1 } : { scale: 1 }}
                  transition={{ duration: 0.1 }}
                >
                  {feature.icon}
                </motion.div>
                <h3 className="text-xl sm:text-2xl font-semibold mb-3 text-white">{feature.title}</h3>
                <p className="text-gray-200 text-base sm:text-lg">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Testimonials Section */}
        <motion.section
          id="testimonials"
          variants={sectionVariants}
          className="py-20 bg-barber-animated relative"
          style={{ backgroundImage: `url(${backgroundImages.testimonials})`, backgroundPositionY: `${scrollY * 0.15}px` }}
          role="region"
          aria-label="Testimonials Section"
        >
          <div className="absolute inset-0 bg-gray-800/75"></div>
          <div className="relative container mx-auto px-4 sm:px-6 lg:px-16">
            <motion.h2
              className="text-3xl sm:text-4xl lg:text-5xl font-bold text-center text-white mb-12 sm:mb-16 drop-shadow-md"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3 }}
            >
              What Our Users Say
            </motion.h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {[
                { name: "Alex J.", quote: "Best barber booking platform!", rating: 5, avatar: testimonialAvatars[0] },
                { name: "Sarah L.", quote: "So many great salons to choose from.", rating: 5, avatar: testimonialAvatars[1] },
                { name: "Mike D.", quote: "Booking is super easy and fast.", rating: 4, avatar: testimonialAvatars[2] },
              ].map((testimonial, index) => (
                <motion.div
                  key={index}
                  className="bg-white/10 backdrop-blur-lg rounded-xl p-6 text-center text-white border border-white/15 shadow-md"
                  variants={featureVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  role="article"
                  aria-label={`Testimonial by ${testimonial.name}`}
                >
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-16 h-16 rounded-full mx-auto mb-4 object-cover"
                    loading="lazy"
                  />
                  <div className="flex justify-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-indigo-300 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-200 text-base sm:text-lg mb-4 italic">"{testimonial.quote}"</p>
                  <h4 className="text-lg sm:text-xl font-semibold text-white">{testimonial.name}</h4>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Call to Action Section */}
        <motion.section
          id="cta"
          variants={sectionVariants}
          className="py-20 bg-barber-animated relative"
          style={{ backgroundImage: `url(${backgroundImages.cta})`, backgroundPositionY: `${scrollY * 0.15}px` }}
          role="region"
          aria-label="Call to Action Section"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/70 to-slate-600/70"></div>
          <div className="relative container mx-auto px-4 sm:px-6 text-center">
            <motion.h2
              className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 sm:mb-8 text-white drop-shadow-md"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3 }}
            >
              Ready for Your Next Cut?
            </motion.h2>
            <motion.p
              className="text-lg sm:text-xl mb-8 sm:mb-10 max-w-2xl mx-auto text-gray-100"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1, duration: 0.3 }}
            >
              Book your barber appointment now with Halaqe.
            </motion.p>
            <motion.button
              className="px-6 py-3 sm:px-8 sm:py-4 bg-white text-indigo-600 text-lg sm:text-xl font-semibold rounded-full shadow-lg"
              variants={buttonVariants}
              initial="initial"
              whileHover="hover"
              whileTap="tap"
              aria-label="Book Appointment Now"
            >
              Book Now
              <motion.span
                className="inline-block ml-2"
                animate={shouldReduceMotion ? { rotate: 0 } : { rotate: [0, 360] }}
                transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
              >
                ✨
              </motion.span>
            </motion.button>
          </div>
        </motion.section>
      </motion.div>
    </>
  );
};

export default WelcomePage;