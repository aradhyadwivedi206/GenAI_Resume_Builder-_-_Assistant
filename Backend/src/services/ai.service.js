const { GoogleGenAI } = require("@google/genai");
const { z } = require("zod");
const puppeteer=require("puppeteer")
const { zodToJsonSchema } = require("zod-to-json-schema");


// ==========================
// GEMINI CLIENT
// ==========================

const ai = new GoogleGenAI({
    apiKey: process.env.GOOGLE_GENAI_API_KEY
});



// ==========================
// ZOD SCHEMA
// ==========================

const interviewReportSchema = z.object({

    title: z.string(),

    matchScore: z.number()
        .min(0)
        .max(100),


    technicalQuestions: z.array(
        z.object({
            question: z.string(),
            intention: z.string(),
            answer: z.string()
        })
    ),


    behavioralQuestions: z.array(
        z.object({
            question: z.string(),
            intention: z.string(),
            answer: z.string()
        })
    ),


    skillGaps: z.array(
        z.object({

            skill: z.string(),

            severity: z
                .string()
                .transform(v => v.toLowerCase())
                .pipe(
                    z.enum([
                        "low",
                        "medium",
                        "high"
                    ])
                )
        })
    ),


    preparationPlan: z.array(
        z.object({

            day: z.number(),

            focus: z.string(),

            tasks: z.array(
                z.string()
            )

        })
    ),
title: z.string().describe("The title of the job for which the interview report is generated")

});




// ==========================
// GEMINI RESPONSE SCHEMA
// ==========================


const geminiSchema = {

    type: "OBJECT",

    properties: {

        title: {
            type: "STRING"
        },


        matchScore: {
            type: "NUMBER"
        },


        technicalQuestions: {

            type: "ARRAY",

            items: {

                type: "OBJECT",

                properties: {

                    question:{
                        type:"STRING"
                    },

                    intention:{
                        type:"STRING"
                    },

                    answer:{
                        type:"STRING"
                    }

                },

                required:[
                    "question",
                    "intention",
                    "answer"
                ]
            }
        },



        behavioralQuestions: {

            type:"ARRAY",

            items: {

                type:"OBJECT",

                properties: {

                    question:{
                        type:"STRING"
                    },

                    intention:{
                        type:"STRING"
                    },

                    answer:{
                        type:"STRING"
                    }

                },

                required:[
                    "question",
                    "intention",
                    "answer"
                ]

            }

        },



        skillGaps: {

            type:"ARRAY",

            items: {

                type:"OBJECT",

                properties: {

                    skill:{
                        type:"STRING"
                    },

                    severity:{
                        type:"STRING",
                        enum:[
                            "low",
                            "medium",
                            "high"
                        ]
                    }

                },

                required:[
                    "skill",
                    "severity"
                ]

            }

        },



        preparationPlan: {

            type:"ARRAY",

            items: {

                type:"OBJECT",

                properties: {

                    day:{
                        type:"NUMBER"
                    },

                    focus:{
                        type:"STRING"
                    },

                    tasks:{
                        type:"ARRAY",
                        items:{
                            type:"STRING"
                        }
                    }

                },

                required:[
                    "day",
                    "focus",
                    "tasks"
                ]

            }

        }

    },


    required:[

        "title",
        "matchScore",
        "technicalQuestions",
        "behavioralQuestions",
        "skillGaps",
        "preparationPlan"

    ]

};






// ==========================
// GENERATE INTERVIEW REPORT
// ==========================


async function generateInterviewReport({

    resume,

    selfDescription,

    jobDescription

}) {


const prompt = `

You are a senior technical interviewer.

Generate an interview preparation report.

STRICT RULES:

- Return only JSON.
- Follow schema exactly.
- No markdown.
- No explanations.
- No extra fields.
- Technical questions must be objects.
- Behavioral questions must be objects.
- Answers should be under 60 words.

Generate:

- 8 technical questions
- 5 behavioral questions
- 3 skill gaps
- 7 day preparation plan


Candidate Resume:

${resume}


Candidate Description:

${selfDescription}


Job Description:

${jobDescription}

`;



try {


const response = await ai.models.generateContent({

    model:"gemini-3-flash-preview",

    contents:[
        {
            role:"user",

            parts:[
                {
                    text:prompt
                }
            ]
        }
    ],


    config:{

        temperature:0,

        maxOutputTokens:12000,

        responseMimeType:"application/json",

        responseSchema:geminiSchema

    }

});




let jsonData;


try{

    jsonData = JSON.parse(response.text);

}

catch(err){

    throw new Error(
        "Gemini returned invalid JSON"
    );

}




// Normalize severity

if(Array.isArray(jsonData.skillGaps)){

    jsonData.skillGaps =
        jsonData.skillGaps.map(item => ({

            ...item,

            severity:
                String(item.severity)
                .toLowerCase()

        }));

}




const result =
    interviewReportSchema.safeParse(jsonData);



if(!result.success){

    console.log(
        "ZOD VALIDATION FAILED",
        result.error.errors
    );

    throw new Error(
        "Invalid AI response format"
    );

}




return result.data;



}

catch(error){


console.error(
    "AI GENERATION ERROR:",
    error.message
);


throw error;


}


}


async function generatePdfFromHtml(htmlContent) {
    const browser = await puppeteer.launch()
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: "networkidle0" })

    const pdfBuffer = await page.pdf({
        format: "A4", margin: {
            top: "20mm",
            bottom: "20mm",
            left: "15mm",
            right: "15mm"
        }
    })

    await browser.close()

    return pdfBuffer
}

async function generateResumePdf({ resume, selfDescription, jobDescription }) {

    const resumePdfSchema = z.object({
        html: z.string().describe("The HTML content of the resume which can be converted to PDF using any library like puppeteer")
    })

    const prompt = `Generate resume for a candidate with the following details:
                        Resume: ${resume}
                        Self Description: ${selfDescription}
                        Job Description: ${jobDescription}

                        the response should be a JSON object with a single field "html" which contains the HTML content of the resume which can be converted to PDF using any library like puppeteer.
                        The resume should be tailored for the given job description and should highlight the candidate's strengths and relevant experience. The HTML content should be well-formatted and structured, making it easy to read and visually appealing.
                        The content of resume should be not sound like it's generated by AI and should be as close as possible to a real human-written resume.
                        you can highlight the content using some colors or different font styles but the overall design should be simple and professional.
                        The content should be ATS friendly, i.e. it should be easily parsable by ATS systems without losing important information.
                        The resume should not be so lengthy, it should ideally be 1-2 pages long when converted to PDF. Focus on quality rather than quantity and make sure to include all the relevant information that can increase the candidate's chances of getting an interview call for the given job description.
                    `

    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: zodToJsonSchema(resumePdfSchema),
        }
    })


    const jsonContent = JSON.parse(response.text)

    const pdfBuffer = await generatePdfFromHtml(jsonContent.html)

    return pdfBuffer

}


module.exports = {

    generateInterviewReport,generateResumePdf

};