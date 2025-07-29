import { prepareInstructions } from "constants";
import React, { useState, type FormEvent } from "react";
import { useNavigate } from "react-router";
import FileUploader from "~/components/FileUploader";
import Navbar from "~/components/Navbar";
import { convertPdfToImage } from "~/lib/pdf2img";
import { usePuterStore } from "~/lib/puter";
import { generateUUID } from "~/lib/utils";

const Upload = () => {
	const { auth, fs, isLoading, ai, kv } = usePuterStore();
	const navigate = useNavigate();
	const [isProcessing, setIsProcessing] = useState(false);
	const [statusText, setStatusText] = useState("");
	const [file, setFile] = useState<File | null>(null);
	const handleFileSelect = (file: File | null) => {
		setFile(file);
	};
	const handleAnalyze = async ({
		companyName,
		jobTitle,
		jobDescription,
		file,
	}: {
		companyName: string;
		jobTitle: string;
		jobDescription: string;
		file: File;
	}) => {
		setIsProcessing(true);
		setStatusText("Analyzing your resume...");
		const uploadedFile = await fs.upload([file]);

		if (!uploadedFile)
			return setStatusText("File upload failed. Please try again.");
		setStatusText("Converting to image...");
		const imagefile = await convertPdfToImage(file);
		if (!imagefile.file)
			return setStatusText("Image conversion failed. Please try again.");
		setStatusText("Uploading the image...");
		const uploadedImage = await fs.upload([imagefile.file]);
		if (!uploadedImage)
			return setStatusText("Image upload failed. Please try again.");
		setStatusText("Preparing data...");

		const uuid = generateUUID();
		const data = {
			id: uuid,
			resumePath: uploadedFile.path,
			imagePath: uploadedImage.path,
			companyName,
			jobTitle,
			jobDescription,
			feedback: "",
		};
		await kv.set(`resume:${uuid}`, JSON.stringify(data));
		setStatusText("Analyzing resume with AI...");
		const feedback = await ai.feedback(
			uploadedFile.path,
			prepareInstructions({ jobTitle, jobDescription })
		);
		if (!feedback)
			return setStatusText("AI analysis failed. Please try again.");
		const feedbackText =
			typeof feedback.message.content === "string"
				? feedback.message.content
				: feedback.message.content[0].text;
		data.feedback = JSON.parse(feedbackText);
		await kv.set(`resume:${uuid}`, JSON.stringify(data));
		setStatusText("Analysis complete! Redirecting...");
		console.log(data);
		navigate(`/resume/${uuid}`);
	};

	const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const form = e.currentTarget.closest("form");
		if (!form) return;
		const formData = new FormData(form);
		const companyName = formData.get("company-name") as string;
		const jobTitle = formData.get("job-title") as string;
		const jobDescription = formData.get("job-description") as string;
		if (!file) return;
		handleAnalyze({ companyName, jobTitle, jobDescription, file });
	};
	return (
		<main className="bg-[url('/images/bg-main.svg')] bg-cover">
			<Navbar />
			<section className="main-section">
				<div className="page-heading py-16">
					<h1>Smart feedback for your dream job</h1>
					{isProcessing ? (
						<>
							<h2>{statusText}</h2>
							<img
								src="/images/resume-scan.gif"
								alt="resume-gif"
								className="w-full"
							/>
						</>
					) : (
						<h2>Drop your resume for an ATS score and improvement tips.</h2>
					)}
					{!isProcessing && (
						<form
							id="upload-form"
							onSubmit={handleSubmit}
							className="flex flex-co gap-4  mt-8"
						>
							<div className="form-div">
								<label htmlFor="company-name">Company Name</label>
								<input
									type="text"
									id="company-name"
									name="company-name"
									placeholder="Enter company name"
									required
								/>
							</div>
							<div className="form-div">
								<label htmlFor="job-title">Job Title</label>
								<input
									type="text"
									id="job-title"
									name="job-title"
									placeholder="Enter job title"
									required
								/>
							</div>
							<div className="form-div">
								<label htmlFor="job-description">Job Description</label>
								<textarea
									rows={5}
									id="job-description"
									name="job-description"
									placeholder="Enter job description"
									required
								/>
							</div>
							<div className="form-div">
								<label htmlFor="company-name">Upload Resume</label>
								<FileUploader onFileSelect={handleFileSelect} />
							</div>
							<button className="primary-button" type="submit">
								Analyze Resume
							</button>
						</form>
					)}
				</div>
			</section>
		</main>
	);
};

export default Upload;
