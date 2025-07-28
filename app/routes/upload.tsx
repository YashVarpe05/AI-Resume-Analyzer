import React, { useState, type FormEvent } from "react";
import FileUploader from "~/components/FileUploader";
import Navbar from "~/components/Navbar";

const Upload = () => {
	const [isProcessing, setIsProcessing] = useState(false);
	const [statusText, setStatusText] = useState("");
	const [file, setFile] = useState<File | null>(null);
	const handleFileSelect = (file: File | null) => {
		setFile(file);
	};

	const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const form = e.currentTarget.closest("form");
		if (!form) return;
		const formData = new FormData(form);
		const companyName = formData.get("company-name");
		const jobTitle = formData.get("job-title");
		const jobDescription = formData.get("job-description");
		if (!file) return;
		
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
