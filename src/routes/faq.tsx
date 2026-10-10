import { createFileRoute } from "@tanstack/react-router";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const Route = createFileRoute("/faq")({
  component: RouteComponent,
});

type QuestionnaireItems = { question: string; answer: string }[];
type FAQItems = { category: string; questionnaire: QuestionnaireItems }[];

const faqItems: FAQItems = [
  {
    category: "About the Golden Jubilee",
    questionnaire: [
      {
        question: "What is the MPSC Golden Jubilee?",
        answer:
          "The MPSC Golden Jubilee celebrates 50 years of excellence, memories, achievement, and togetherness at Mohammadpur Preparatory School & College. It honours the institution's proud heritage and the generations of people who have contributed to its journey.",
      },
      {
        question:
          "When was Mohammadpur Preparatory School & College established?",
        answer:
          "Mohammadpur Preparatory School & College was established in 1976. Its Golden Jubilee marks five decades of educational excellence and community building.",
      },
      {
        question: "Why is the Golden Jubilee significant?",
        answer:
          "The Golden Jubilee is a milestone celebrating 50 years of academic achievement, discipline, leadership, cultural engagement, friendship, and institutional growth. It is also an opportunity to honour the people and shared experiences that have shaped MPSC over the years.",
      },
      {
        question: "What does the Golden Jubilee represent?",
        answer:
          "The Golden Jubilee represents MPSC's proud past, vibrant present, and hopeful future. It celebrates the institution's lasting values, honours its legacy, and looks ahead to the next chapter of its journey.",
      },
    ],
  },
  {
    category: "Celebration & Activities",
    questionnaire: [
      {
        question: "What is the purpose of the Golden Jubilee celebration?",
        answer:
          "The celebration aims to bring the MPSC community together to reconnect, reminisce, recognize achievements, honour contributions, and strengthen the bonds that have endured long after school and college life.",
      },
      {
        question: "What kinds of activities will be part of the celebration?",
        answer:
          "The Golden Jubilee aims to feature a series of commemorative, cultural, and alumni-focused activities designed to honour MPSC's history and create a memorable experience worthy of this historic milestone.",
      },
      {
        question:
          "Will the celebration include opportunities to revisit old memories?",
        answer:
          "Yes. Revisiting treasured memories and reconnecting with old friends, teachers, and fellow members of the MPSC family are central themes of the Golden Jubilee celebration.",
      },
      {
        question: "How will the Golden Jubilee celebrate MPSC's heritage?",
        answer:
          "The celebration will reflect on five decades of academic accomplishments, cultural engagement, leadership, friendship, and institutional development while recognizing the contributions that have shaped MPSC's identity.",
      },
    ],
  },
  {
    category: "Alumni & MPSC Community",
    questionnaire: [
      {
        question: "Who is the Golden Jubilee celebration for?",
        answer:
          "The celebration is intended for former and current students, teachers, administrators, guardians, alumni, and well-wishers—in short, everyone who has been part of or contributed to the wider MPSC family.",
      },
      {
        question: "Why are alumni important to the Golden Jubilee?",
        answer:
          "Alumni are an integral part of MPSC's legacy. Their achievements, experiences, and lifelong connections reflect the institution's lasting impact across generations. The Golden Jubilee provides an opportunity to celebrate their contributions and strengthen their connection with MPSC.",
      },
      {
        question:
          "Will former students and teachers have an opportunity to reconnect?",
        answer:
          "Reconnecting with former classmates, teachers, and other members of the MPSC community is one of the key purposes of the Golden Jubilee. The celebration is designed to bring generations together through shared memories and a common heritage.",
      },
      {
        question: "How does the Golden Jubilee honour MPSC's teachers?",
        answer:
          "The Golden Jubilee recognizes the dedication of the teachers who have guided generations of students. It celebrates their role in shaping character, encouraging achievement, and contributing to the institution's enduring legacy.",
      },
    ],
  },
  {
    category: "Legacy & Future",
    questionnaire: [
      {
        question: "What achievements does the Golden Jubilee celebrate?",
        answer:
          "It celebrates five decades of academic achievement, discipline, leadership, friendship, cultural engagement, and institutional growth, along with the collective contributions of students, teachers, administrators, guardians, alumni, and well-wishers.",
      },
      {
        question: "How has MPSC evolved over the past 50 years?",
        answer:
          "Since its establishment in 1976, MPSC has grown beyond an educational institution into a lasting community that has shaped generations of students. Through changing times, it has continued to uphold the values and spirit at the heart of its identity.",
      },
      {
        question: "What does the Golden Jubilee mean for the next generation?",
        answer:
          "The Golden Jubilee offers an opportunity to pass on MPSC's heritage, values, and sense of community to future generations. It also expresses hope and ambition for the institution's continued growth and achievements in the years ahead.",
      },
      {
        question: "What is the message of the MPSC Golden Jubilee?",
        answer:
          "The Golden Jubilee is a tribute to 50 years of shared history, dedication, achievement, and togetherness. It honours the past, celebrates the present, and looks forward to a future filled with promise for Mohammadpur Preparatory School & College and its community.",
      },
    ],
  },
];

function RouteComponent() {
  return (
    <section className="mx-auto mt-10 max-w-4xl px-6 py-30">
      <div className="mb-10 max-w-3xl">
        <h1>Frequently Asked Questions</h1>
      </div>

      <div className="space-y-10">
        {faqItems.map((section) => (
          <div key={section.category} className="space-y-4">
            <h2 className="text-primary">{section.category}</h2>
            <Accordion>
              {section.questionnaire.map((item) => (
                <AccordionItem key={item.question}>
                  <AccordionTrigger className="text-base hover:text-accent hover:no-underline sm:text-lg">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent>
                    <p className="text-base text-muted-foreground">
                      {item.answer}
                    </p>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        ))}
      </div>
    </section>
  );
}
