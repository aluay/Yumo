import { createImageUpload } from "novel";
import { toast } from "sonner";

const onUpload = (file: File) => {
	const promise = fetch("/api/v1/upload", {
		method: "POST",
		headers: {
			"content-type": file?.type || "application/octet-stream",
		},
		body: file,
	});

	return new Promise((resolve, reject) => {
		toast.promise(
			promise.then(async (res) => {
				if (!res.ok) {
					throw new Error("Image upload failed.");
				}

				const { url } = (await res.json()) as { url: string };

				// Preload image to avoid flicker
				const img = new Image();
				img.src = url;
				img.onload = () => resolve(url);
			}),
			{
				loading: "Uploading image...",
				success: "Image uploaded!",
				error: (e) => {
					reject(e);
					return e.message || "Failed to upload image.";
				},
			}
		);
	});
};

export const uploadFn = createImageUpload({
	onUpload,
	validateFn: (file) => {
		if (!file.type.includes("image/")) {
			toast.error("Only images are supported.");
			return false;
		}
		if (file.size / 1024 / 1024 > 20) {
			toast.error("Max file size is 20MB.");
			return false;
		}
		return true;
	},
});

// import { createImageUpload } from "novel";
// import { toast } from "sonner";

// const onUpload = (file: File) => {
//   const promise = fetch("/api/upload", {
//     method: "POST",
//     headers: {
//       "content-type": file?.type || "application/octet-stream",
//       "x-vercel-filename": file?.name || "image.png",
//     },
//     body: file,
//   });

//   return new Promise((resolve, reject) => {
//     toast.promise(
//       promise.then(async (res) => {
//         // Successfully uploaded image
//         if (res.status === 200) {
//           const { url } = (await res.json()) as { url: string };
//           // preload the image
//           const image = new Image();
//           image.src = url;
//           image.onload = () => {
//             resolve(url);
//           };
//           // No blob store configured
//         } else if (res.status === 401) {
//           resolve(file);
//           throw new Error(
//             "`BLOB_READ_WRITE_TOKEN` environment variable not found, reading image locally instead."
//           );
//           // Unknown error
//         } else {
//           throw new Error("Error uploading image. Please try again.");
//         }
//       }),
//       {
//         loading: "Uploading image...",
//         success: "Image uploaded successfully.",
//         error: (e) => {
//           reject(e);
//           return e.message;
//         },
//       }
//     );
//   });
// };

// export const uploadFn = createImageUpload({
//   onUpload,
//   validateFn: (file) => {
//     if (!file.type.includes("image/")) {
//       toast.error("File type not supported.");
//       return false;
//     }
//     if (file.size / 1024 / 1024 > 20) {
//       toast.error("File size too big (max 20MB).");
//       return false;
//     }
//     return true;
//   },
// });
