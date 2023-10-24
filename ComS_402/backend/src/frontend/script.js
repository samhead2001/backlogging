if (window.location.href.includes('success.html')) {
    function returnHomeScreen() {
        window.location.href = 'upload.html';
    }
    function timeConversion(militaryTime) {
        let colonIndex = militaryTime.indexOf(":")
        let hours = militaryTime.substring(0, colonIndex);
        let minutes = militaryTime.substring(colonIndex + 1);
        let ampm = "AM";
        if(hours > 12)
        {
            ampm = "PM";
            hours = hours - 12;
        }
        return hours + ":" + minutes + " " + ampm;
    }
    document.getElementById("sumCourseID").textContent = localStorage.getItem("course");
    document.getElementById("sumGroupSizeID").textContent = localStorage.getItem("groupSize");
    document.getElementById("sumDeadlineDateID").textContent = localStorage.getItem("deadlineDate");
    document.getElementById("sumDeadlineTimeID").textContent = timeConversion(localStorage.getItem("deadlineTime"));
    document.getElementById("sumFileID").textContent = localStorage.getItem("uploadedFile");
}
else {
    const dropArea = document.getElementById("dropArea");
    const fileInput = document.getElementById("fileInput");
    const uploadStatus = document.getElementById("uploadStatus");
    const removeFileButton = document.getElementById('removeFileButton');
    const selectedFile = document.getElementById("selectedFile");
    const deadlineDateInput = document.getElementById("deadlineDateID")
    const deadlineTimeInput = document.getElementById("deadlineTimeID")

    // event listeners for dragging and dropping of files
    dropArea.addEventListener("dragenter", (e) => {
        e.preventDefault();
        dropArea.classList.add("highlight");
    });
    
    dropArea.addEventListener("dragover", (e) => {
        e.preventDefault();
    });
    
    dropArea.addEventListener("dragleave", () => {
        dropArea.classList.remove("highlight");
    });
    
    dropArea.addEventListener("drop", (e) => {
        e.preventDefault();
        dropArea.classList.remove("highlight");
    
        const files = e.dataTransfer.files;
        fileInput.files = files;
        if (fileInput.files.length > 0) {
            selectedFile.textContent = `Selected File: ${fileInput.files[0].name}`;
            removeFileButton.style.display = "inline";
            uploadStatus.textContent = "";

            // check if the file contains the column "SIS Login ID" (presumably, the net-id column)
            isValidCSV(fileInput.files[0]);
        } else {
            selectedFile.textContent = "No file selected";
            removeFileButton.style.display = "none";
            uploadStatus.textContent = "";
        }
    });
    
    // event listener for normal selection of file
    fileInput.addEventListener("change", () => {
        if (fileInput.files.length > 0) {
            selectedFile.textContent = `Selected File: ${fileInput.files[0].name}`;
            removeFileButton.style.display = "inline";
            uploadStatus.textContent = "";
            
            // check if the file contains the column "SIS Login ID" (presumably, the net-id column)
            isValidCSV(fileInput.files[0]);
        } else {
            selectedFile.textContent = "No file selected";
            removeFileButton.style.display = "none";
            uploadStatus.textContent = "";
        }
    });
    // event listener for removal of file
    removeFileButton.addEventListener("click", () => {
        fileInput.value = ""; // removes previously selected file
        selectedFile.textContent = "No file selected";
        removeFileButton.style.display = "none";
        uploadStatus.textContent = "";
    });
    
    // event listener for the upload of the inputs and csv file
    document.querySelector("form").addEventListener("submit", async (e) => {
        e.preventDefault()
        if (fileInput.files.length > 0) {
            const isValid = await isValidCSV(fileInput.files[0]);
            
            if (!isValid) {
                e.preventDefault();
                uploadStatus.style.visibility = "visible";
                uploadStatus.textContent = "Invalid CSV - Missing column 'SIS Login ID' or 'Student'";
            }
            else {
                const course= document.getElementById("courseID").value;
                const groupSize = document.getElementById("groupSizeID").value;

                const convertDate = new Date(deadlineDateInput.value);
                const deadlineDate = convertDate.toLocaleDateString();
                
                const deadlineTime = deadlineTimeInput.value;
                const uploadedFile = fileInput.files[0].name;

                localStorage.setItem("course", course);
                localStorage.setItem("groupSize", groupSize);
                localStorage.setItem("deadlineDate", deadlineDate);
                localStorage.setItem("deadlineTime", deadlineTime);
                localStorage.setItem("uploadedFile", uploadedFile);
                
                e.target.submit();
            }
        }
        else {

            e.preventDefault();
            uploadStatus.style.visibility = "visible";
            uploadStatus.textContent = "Please select a file to upload.";
        }
    });
    // Below function to be implemented later to ensure CSV contains net-ids
    async function isValidCSV(file) {
        let temp = new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = function(event) {
                const fileContent = event.target.result;
                const lines = fileContent.split('\n');
                const headerRow = lines[0];
                const columnTitles = headerRow.split(',');
    
                if (columnTitles.includes("SIS Login ID") && columnTitles.includes("Student")) {
                    resolve(true); // Resolve with true if CSV is valid
                } else {
                    resolve(false);
                }
            };
            reader.onerror = function(event) {
                console.log("Error reading the file:", event.target.error);
                reject("Error reading the file."); // Reject with an error message
            };
            // Read file as a text string. This is for the reader.onload event to work.
            reader.readAsText(file);
        });
        return await temp;
    }
    function setDateRange() {
        const currentDate = new Date();
        let minDateString = new Date(currentDate).toISOString();
        minDateString = minDateString.substring(0, minDateString.indexOf('T'));

        let maxDate = new Date(currentDate);
        maxDate.setDate(currentDate.getDate() + 7);
        let maxDateString = maxDate.toISOString();
        maxDateString = maxDateString.substring(0, maxDateString.indexOf('T'));

        deadlineDateInput.setAttribute('min', minDateString);
        deadlineDateInput.setAttribute('max', maxDateString);
    }
    setDateRange()
}
