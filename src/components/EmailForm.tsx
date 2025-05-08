import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Textarea } from "@/components/ui/textarea";
import emailjs from "@emailjs/browser";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  name: z.string().min(1, "Name must be at least 1 characters."),
  email: z.string().email("Email address is not correct"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

const EmailForm = ({ className }: { className: string }) => {
  const ref = useRef<HTMLFormElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      message: "",
    },
    mode: "onChange",
  });

  // 提交触发函数
  const onSubmit = async () => {
    try {
      setIsSubmitting(true);
      const res = await emailjs.sendForm(
        "service_232i637", // service id
        "template_x2owglr", // template id
        ref.current!,
        { publicKey: "2SGQsSp3QjRWchyNk" }
      );
      // 成功后触发
      if (res.status === 200) {
        toast("Email sent successfully", {
          description: "Thank u for ur message, will reply soon",
          action: {
            label: "Got it",
            onClick: () => console.log(""),
          },
        });
      }
      form.reset();
    } catch (error) {
      // 捕获错误
      console.error(error);
      toast("Something went wrong", {
        description: "Please try again later",
        action: {
          label: "Got it",
          onClick: () => console.log(""),
        },
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn("space-y-3", className)}
        ref={ref}
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>name</FormLabel>
              <FormControl>
                <Input placeholder="Your name" autoComplete="off" {...field} />
              </FormControl>
              <div className="min-h-5">
                <FormMessage />
              </div>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="Your email" autoComplete="off" {...field} />
              </FormControl>
              <div className="min-h-5">
                <FormMessage />
              </div>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Message</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Say something..."
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <div className="min-h-5">
                <FormMessage />
              </div>
            </FormItem>
          )}
        />
        <div className="flex justify-center md:justify-start">
          <Button
            className="hover:cursor-pointer"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Sending" : "Submit"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default EmailForm;
