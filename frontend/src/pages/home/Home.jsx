// src/pages/Home.jsx
import {
	Banner,
	Contacts,
	Footer,
	News,
	Questions,
	QuikLinks,
	Statistics,
	Technologies,
} from "../home/index"

import { motion } from "framer-motion"

// 🔹 Animatsiya funksiyasi
const fadeIn = (direction = "up", delay = 0) => ({
	hidden: {
		opacity: 0,
		y: direction === "up" ? 50 : direction === "down" ? -50 : 0,
		x: direction === "left" ? 50 : direction === "right" ? -50 : 0,
		scale: 0.95,
	},
	show: {
		opacity: 1,
		y: 0,
		x: 0,
		scale: 1,
		transition: {
			type: "spring",
			duration: 0.9,
			delay,
		},
	},
})

const Home = () => {
	return (
		<div className="w-full min-h-screen flex flex-col bg-gray-50 text-gray-800 overflow-x-hidden">
			{/* 🔹 Barchasi bitta Banner komponentida */}
			<motion.div
				variants={fadeIn("up", 0.1)}
				initial="hidden"
				animate="show"
			>
				<Banner />
			</motion.div>

			{/* 🔹 Yangiliklar */}
			<motion.div
				variants={fadeIn("up", 0.2)}
				initial="hidden"
				whileInView="show"
				viewport={{ once: true, amount: 0.3 }}
			>
				<News />
			</motion.div>

			{/* 🔹 Statistikalar */}
			<motion.div
				variants={fadeIn("up", 0.3)}
				initial="hidden"
				whileInView="show"
				viewport={{ once: true, amount: 0.3 }}
			>
				<Statistics />
			</motion.div>
			{/* 🔹 Statistikalar */}
			<motion.div
				variants={fadeIn("up", 0.3)}
				initial="hidden"
				whileInView="show"
				viewport={{ once: true, amount: 0.3 }}
			>
				<Technologies />
			</motion.div>

			{/* 🔹 Savol-javoblar */}
			<motion.div
				variants={fadeIn("up", 0.4)}
				initial="hidden"
				whileInView="show"
				viewport={{ once: true, amount: 0.3 }}
			>
				<Questions />
			</motion.div>

			{/* 🔹 Aloqa qismi */}
			<motion.div
				variants={fadeIn("up", 0.5)}
				initial="hidden"
				whileInView="show"
				viewport={{ once: true, amount: 0.3 }}
			>
				<Contacts />
			</motion.div>

			{/* 🔹 Tashqi havolalar / hamkor logolar */}
			<motion.div
				variants={fadeIn("up", 0.6)}
				initial="hidden"
				whileInView="show"
				viewport={{ once: true, amount: 0.3 }}
			>
				<QuikLinks />
			</motion.div>

			{/* 🔹 Pastki qism (Footer) */}
			<motion.div
				variants={fadeIn("up", 0.7)}
				initial="hidden"
				whileInView="show"
				viewport={{ once: true, amount: 0.3 }}
			>
				<Footer />
			</motion.div>
		</div>
	)
}

export default Home