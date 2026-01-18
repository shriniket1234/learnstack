import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

export function NotesPage() {
  const [notes, setNotes] = useState("");

  const saveNotes = () => {
    // Placeholder: In real app, save to backend
    localStorage.setItem("notes", notes);
    alert("Notes saved!");
  };

  const loadNotes = () => {
    const saved = localStorage.getItem("notes") || "";
    setNotes(saved);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Notes App</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <Button onClick={saveNotes}>Save Notes</Button>
            <Button variant="outline" onClick={loadNotes}>
              Load Notes
            </Button>
          </div>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Write your notes here..."
            className="min-h-[400px]"
          />
        </CardContent>
      </Card>
    </div>
  );
}
