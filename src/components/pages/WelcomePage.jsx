import { useMemo, useState, useEffect } from "react";
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
  @keyframes barberStripe {
    0% { background-position: 0 0; }
    100% { background-position: 0 240px; }
  }
  @keyframes floatBlob {
    0% { transform: translate3d(0,0,0) scale(1); }
    50% { transform: translate3d(12px,-10px,0) scale(1.06); }
    100% { transform: translate3d(0,0,0) scale(1); }
  }
  .bg-barber-animated {
    animation: bgZoom 10s ease-in-out infinite;
    background-size: cover;
    background-position: center;
    will-change: transform;
  }
  .hero-blob {
    filter: blur(28px);
    animation: floatBlob 9s ease-in-out infinite;
    will-change: transform;
  }
  .noise-overlay {
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='120' height='120' filter='url(%23n)' opacity='.25'/%3E%3C/svg%3E");
    mix-blend-mode: overlay;
    opacity: .28;
    pointer-events: none;
  }
  .barber-pole {
    background: linear-gradient(
      135deg,
      rgba(255,255,255,.92) 0%,
      rgba(255,255,255,.92) 20%,
      rgba(56,189,248,.95) 20%,
      rgba(56,189,248,.95) 40%,
      rgba(255,255,255,.92) 40%,
      rgba(255,255,255,.92) 60%,
      rgba(59,130,246,.95) 60%,
      rgba(59,130,246,.95) 80%,
      rgba(255,255,255,.92) 80%,
      rgba(255,255,255,.92) 100%
    );
    background-size: 100% 240px;
    animation: barberStripe 2.2s linear infinite;
  }
  .wave-divider {
    height: 64px;
    width: 100%;
    display: block;
  }
  @media (prefers-reduced-motion) {
    .bg-barber-animated { animation: none; }
    .hero-blob { animation: none; }
    .barber-pole { animation: none; }
  }
`;

const BarberPole = ({ shouldReduceMotion }) => {
  return (
    <div className="relative mx-auto h-[320px] w-[160px] sm:h-[360px] sm:w-[180px]">
      <div className="absolute inset-x-0 top-0 h-8 rounded-full bg-gradient-to-b from-slate-100 to-slate-300 shadow-lg" />
      <div className="absolute inset-x-4 top-6 bottom-10 rounded-3xl border border-white/30 bg-white/10 backdrop-blur-md shadow-2xl">
        <div className="absolute inset-2 rounded-2xl barber-pole" />
        <div className="absolute inset-2 rounded-2xl ring-1 ring-white/25" />
        {!shouldReduceMotion && (
          <div className="absolute -inset-6 rounded-[42px] bg-[radial-gradient(circle_at_30%_20%,rgba(56,189,248,.35),transparent_60%),radial-gradient(circle_at_70%_80%,rgba(59,130,246,.25),transparent_60%)] blur-2xl" />
        )}
      </div>
      <div className="absolute inset-x-0 bottom-0 h-10 rounded-full bg-gradient-to-b from-slate-200 to-slate-400 shadow-lg" />
      <div className="absolute -left-4 top-10 h-10 w-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 shadow-md" />
      <div className="absolute -right-4 bottom-16 h-12 w-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 shadow-md" />
    </div>
  );
};

const WelcomePage = ({ setCurrentView }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [activeFeature, setActiveFeature] = useState(null);
  const [scrollY, setScrollY] = useState(0);
  const shouldReduceMotion = useReducedMotion();

  const sparklePositions = useMemo(
    () => [
      { top: "28%", left: "32%" },
      { top: "44%", left: "62%" },
      { top: "62%", left: "42%" },
    ],
    []
  );

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
          className="relative min-h-screen flex items-center justify-center bg-barber-animated py-16 sm:py-0"
          style={{ backgroundImage: `url(${backgroundImages.hero})`, backgroundPositionY: `${scrollY * 0.2}px` }}
          role="region"
          aria-label="Hero Section"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-sky-950/80 via-slate-950/55 to-sky-900/30"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_25%,rgba(56,189,248,0.35),transparent_55%),radial-gradient(circle_at_70%_65%,rgba(59,130,246,0.25),transparent_60%)]" />
          <div className="absolute inset-0 noise-overlay" />
          <div className="absolute inset-0 overflow-hidden">
            <div className="hero-blob absolute -top-24 -left-24 h-72 w-72 rounded-full bg-sky-400/40" />
            <div className="hero-blob absolute top-16 -right-24 h-80 w-80 rounded-full bg-blue-500/30 [animation-delay:1200ms]" />
            <div className="hero-blob absolute -bottom-24 left-1/3 h-96 w-96 rounded-full bg-cyan-300/20 [animation-delay:600ms]" />
          </div>
          <div className="relative z-10 w-full px-4 sm:px-6 max-w-6xl mx-auto">
            <div className="mx-auto mb-4 sm:mb-6 inline-flex items-center gap-2 rounded-full border border-sky-100/30 bg-white/10 px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm text-sky-50 backdrop-blur-md shadow-sm">
              <span className="h-2 w-2 rounded-full bg-sky-300" />
              تجربة حجز حديثة للحلاقة والصالونات
            </div>
            <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-10 items-center">
              <motion.div className="absolute -top-4 left-2 sm:left-10" variants={scissorsVariants} initial="initial" animate="animate">
                <Scissors className="w-8 h-8 sm:w-10 sm:h-10 text-sky-200 drop-shadow-md" />
              </motion.div>
              <motion.div className="absolute -top-2 right-2 sm:right-10" variants={brushVariants} initial="initial" animate="animate">
                <Brush className="w-8 h-8 sm:w-10 sm:h-10 text-sky-100/90 drop-shadow-md" />
              </motion.div>
              {sparklePositions.map((pos, i) => (
                <motion.div
                  key={i}
                  className="absolute"
                  style={pos}
                  variants={sparklesVariants}
                  initial="initial"
                  animate="animate"
                >
                  <Sparkles className="w-3 h-3 text-sky-200 opacity-60" />
                </motion.div>
              ))}

              <div className="lg:col-span-7 text-white text-center lg:text-right">
                <motion.h1
                  className="text-3xl sm:text-5xl lg:text-7xl font-extrabold mb-3 sm:mb-6 tracking-tight leading-tight drop-shadow-lg"
                  variants={heroTextVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <span className="bg-gradient-to-l from-sky-200 via-white to-sky-300 bg-clip-text text-transparent">
                    Halaqe
                  </span>
                </motion.h1>
                <motion.p
                  className="text-base sm:text-xl lg:text-2xl mb-5 sm:mb-8 font-light max-w-3xl mx-auto lg:mx-0 text-sky-50/95"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.4 }}
                >
                  احجز موعدك مع أفضل الحلاقين والصالونات بسهولة—بتجربة فاخرة ومريحة.
                </motion.p>
                <div className="flex flex-row gap-3 sm:gap-4 justify-center lg:justify-start items-center lg:items-start">
                  <motion.button
                    className="px-5 py-2.5 sm:px-8 sm:py-4 bg-gradient-to-r from-sky-400 via-sky-500 to-blue-500 text-white text-base sm:text-xl font-semibold rounded-full shadow-lg"
                    variants={buttonVariants}
                    initial="initial"
                    whileHover="hover"
                    whileTap="tap"
                    onClick={() => setCurrentView("register")}
                    aria-label="Sign Up Now"
                  >
                    إنشاء حساب
                  </motion.button>
                  <motion.button
                    className="px-5 py-2.5 sm:px-8 sm:py-4 bg-white/10 backdrop-blur-md border border-sky-100/40 text-white text-base sm:text-xl font-semibold rounded-full shadow-lg"
                    variants={buttonVariants}
                    initial="initial"
                    whileHover="hover"
                    whileTap="tap"
                    onClick={() => setCurrentView("login")}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                    aria-label="Login Now"
                  >
                    تسجيل دخول
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
                <div className="mt-6 sm:mt-8 grid grid-cols-3 gap-2 sm:gap-4">
                  {[
                    { k: "+500", v: "حلاق/صالون" },
                    { k: "24/7", v: "حجز متاح" },
                    { k: "4.8", v: "متوسط التقييم" },
                  ].map((s) => (
                    <div key={s.v} className="rounded-xl sm:rounded-2xl border border-white/10 bg-white/10 px-3 py-3 sm:px-5 sm:py-4 backdrop-blur-md text-center">
                      <div className="text-lg sm:text-2xl font-bold text-white">{s.k}</div>
                      <div className="text-xs sm:text-sm text-sky-50/80">{s.v}</div>
                    </div>
                  ))}
                </div>
                <motion.button
                  className="mt-4 text-white/80 hover:text-white underline text-base sm:text-lg"
                  onClick={() => scrollToSection("features")}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.4 }}
                >
                  اكتشف المزيد
                </motion.button>
              </div>

              <div className="lg:col-span-5">
                <div className="relative mx-auto max-w-md rounded-2xl sm:rounded-3xl border border-white/15 bg-white/10 p-4 sm:p-7 backdrop-blur-xl shadow-2xl">
                  <div className="absolute -top-5 sm:-top-6 left-4 sm:left-6 rounded-xl sm:rounded-2xl border border-white/15 bg-white/10 px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm text-sky-50 backdrop-blur-md">
                    خطوات سريعة للحجز
                  </div>
                  <div className="grid grid-cols-1 gap-3 sm:gap-4 mt-4 sm:mt-6">
                    {[
                      { title: "اختر الخدمة", desc: "قصة شعر، عناية، أو صالون قريب.", icon: <Scissors className="h-4 w-4 sm:h-5 sm:w-5" /> },
                      { title: "حدد الوقت", desc: "شوف المواعيد المتاحة فورًا.", icon: <Calendar className="h-4 w-4 sm:h-5 sm:w-5" /> },
                      { title: "استمتع بالتجربة", desc: "تأكيد سريع وتجربة مرتبة.", icon: <Sparkles className="h-4 w-4 sm:h-5 sm:w-5" /> },
                    ].map((step) => (
                      <div key={step.title} className="flex items-center gap-3 rounded-xl sm:rounded-2xl border border-white/10 bg-white/10 p-3 sm:p-4">
                        <div className="inline-flex h-8 w-8 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-lg sm:rounded-xl bg-gradient-to-br from-sky-400/30 to-blue-500/30 text-sky-50 ring-1 ring-white/20">
                          {step.icon}
                        </div>
                        <div className="text-right min-w-0">
                          <div className="font-semibold text-white text-sm sm:text-base">{step.title}</div>
                          <div className="text-xs sm:text-sm text-sky-50/80">{step.desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 hidden sm:block">
                    <BarberPole shouldReduceMotion={shouldReduceMotion} />
                  </div>
                </div>
              </div>
            </div>
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
          <div className="absolute inset-0 bg-slate-950/70"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(125,211,252,0.25),transparent_55%),radial-gradient(circle_at_80%_60%,rgba(147,197,253,0.18),transparent_60%)]" />
          <motion.h2
            className="relative text-3xl sm:text-4xl lg:text-5xl font-bold text-center text-white mb-12 sm:mb-16 drop-shadow-md"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3 }}
          >
            لماذا Halaqe؟
          </motion.h2>
          <div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {[
              {
                title: "أفضل الحلاقين",
                description: "اكتشف محترفين يقدمون لك القصة المثالية.",
                icon: <Scissors className="w-10 h-10 sm:w-12 sm:h-12 text-sky-200" />,
                image: featureImages.barbers,
              },
              {
                title: "صالات متعددة",
                description: "اختر من صالونات مميزة بالقرب منك.",
                icon: <MapPin className="w-10 h-10 sm:w-12 sm:h-12 text-sky-100/90" />,
                image: featureImages.salons,
              },
              {
                title: "حجز سلس",
                description: "احجز بسهولة في أي وقت ومن أي مكان.",
                icon: <Calendar className="w-10 h-10 sm:w-12 sm:h-12 text-sky-200" />,
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
              آراء المستخدمين
            </motion.h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {[
                { name: "أحمد", quote: "تجربة حجز ممتازة وسريعة.", rating: 5, avatar: testimonialAvatars[0] },
                { name: "سارة", quote: "خيارات كثيرة لصالونات قريبة.", rating: 5, avatar: testimonialAvatars[1] },
                { name: "محمد", quote: "واجهة جميلة وتفاصيل واضحة.", rating: 4, avatar: testimonialAvatars[2] },
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
                      <Star key={i} className="w-5 h-5 text-sky-200 fill-current" />
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
          <div className="absolute inset-0 bg-gradient-to-r from-sky-500/70 via-blue-500/60 to-sky-700/70"></div>
          <div className="relative container mx-auto px-4 sm:px-6 text-center">
            <motion.h2
              className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 sm:mb-8 text-white drop-shadow-md"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3 }}
            >
              جاهز لموعدك القادم؟
            </motion.h2>
            <motion.p
              className="text-lg sm:text-xl mb-8 sm:mb-10 max-w-2xl mx-auto text-gray-100"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1, duration: 0.3 }}
            >
              احجز الآن مع Halaqe واستمتع بتجربة أنيقة وسهلة.
            </motion.p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <motion.button
                className="px-6 py-3 sm:px-8 sm:py-4 bg-white text-sky-700 text-lg sm:text-xl font-semibold rounded-full shadow-lg"
                variants={buttonVariants}
                initial="initial"
                whileHover="hover"
                whileTap="tap"
                onClick={() => setCurrentView("register")}
                aria-label="Book Appointment Now"
              >
                ابدأ الآن
                <motion.span
                  className="inline-block ml-2"
                  animate={shouldReduceMotion ? { rotate: 0 } : { rotate: [0, 360] }}
                  transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
                >
                  ✨
                </motion.span>
              </motion.button>
              <motion.button
                className="px-6 py-3 sm:px-8 sm:py-4 bg-white/10 backdrop-blur-md border border-sky-100/40 text-white text-lg sm:text-xl font-semibold rounded-full shadow-lg"
                variants={buttonVariants}
                initial="initial"
                whileHover="hover"
                whileTap="tap"
                onClick={() => setCurrentView("login")}
                aria-label="Login"
              >
                تسجيل دخول
              </motion.button>
            </div>
          </div>
        </motion.section>
      </motion.div>
    </>
  );
};

export default WelcomePage;