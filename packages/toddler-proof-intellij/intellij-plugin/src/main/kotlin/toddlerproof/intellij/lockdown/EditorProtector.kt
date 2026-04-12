package toddlerproof.intellij.lockdown

import com.intellij.openapi.application.ApplicationManager
import com.intellij.openapi.editor.Document
import com.intellij.openapi.command.WriteCommandAction
import com.intellij.openapi.fileEditor.FileDocumentManager
import com.intellij.openapi.fileEditor.FileEditorManager
import com.intellij.openapi.fileEditor.TextEditor
import com.intellij.openapi.project.ProjectManager

/**
 * Protects editor state during lockdown by:
 * 1. Saving all documents to disk
 * 2. Snapshotting all open document contents
 * 3. Setting all documents to read-only
 * 4. Restoring everything on unlock
 */
class EditorProtector {

    private data class DocumentSnapshot(
        val document: Document,
        val content: String,
        val wasReadOnly: Boolean,
    )

    private val snapshots = mutableListOf<DocumentSnapshot>()

    fun protect() {
        ApplicationManager.getApplication().invokeAndWait {
            // Save all documents first
            FileDocumentManager.getInstance().saveAllDocuments()

            // Snapshot and lock all open editors across all projects
            snapshots.clear()
            for (project in ProjectManager.getInstance().openProjects) {
                val editorManager = FileEditorManager.getInstance(project)
                for (editor in editorManager.allEditors) {
                    if (editor is TextEditor) {
                        val doc = editor.editor.document
                        // Avoid duplicate snapshots (same doc may be open in splits)
                        if (snapshots.any { it.document === doc }) continue

                        snapshots.add(DocumentSnapshot(
                            document = doc,
                            content = doc.text,
                            wasReadOnly = !doc.isWritable,
                        ))
                        doc.setReadOnly(true)
                    }
                }
            }
        }
    }

    fun restore() {
        ApplicationManager.getApplication().invokeAndWait {
            for (snapshot in snapshots) {
                val doc = snapshot.document
                // Temporarily make writable to restore content if needed
                doc.setReadOnly(false)

                if (doc.text != snapshot.content) {
                    // Toddler keystrokes snuck through — restore from snapshot
                    val project = ProjectManager.getInstance().openProjects.firstOrNull()
                    if (project != null) {
                        WriteCommandAction.runWriteCommandAction(project) {
                            doc.setText(snapshot.content)
                        }
                    }
                }

                // Restore original read-only state
                if (snapshot.wasReadOnly) {
                    doc.setReadOnly(true)
                }
            }
            snapshots.clear()
        }
    }
}
