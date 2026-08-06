import { notFound } from "next/navigation";

// Any path not matched by a real route inside a locale is a hard 404.
export default function CatchAll() {
  notFound();
}
