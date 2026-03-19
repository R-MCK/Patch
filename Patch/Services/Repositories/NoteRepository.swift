import Foundation
import CoreData
import Combine

protocol PlantNoteRepository {
    func fetchByPlant(_ plant: Plant) -> [Note]
}

/// Repository for Note entity CRUD operations
@MainActor
final class NoteRepository: ObservableObject {

    private let context: NSManagedObjectContext

    @Published var notes: [Note] = []
    @Published var errorMessage: String?

    init(context: NSManagedObjectContext = PersistenceController.shared.container.viewContext) {
        self.context = context
    }

    // MARK: - Fetch Operations

    /// Fetch all notes (not archived)
    func fetchAll() -> [Note] {
        let request: NSFetchRequest<Note> = Note.fetchRequest()
        request.predicate = NSPredicate(format: "isArchived == NO")
        request.sortDescriptors = [NSSortDescriptor(keyPath: \Note.updatedAt, ascending: false)]

        do {
            let results = try context.fetch(request)
            DispatchQueue.main.async {
                self.notes = results
            }
            return results
        } catch {
            print("Error fetching notes: \(error)")
            self.errorMessage = error.localizedDescription
            return []
        }
    }

    /// Fetch notes by plant
    func fetchByPlant(_ plant: Plant) -> [Note] {
        let request: NSFetchRequest<Note> = Note.fetchRequest()
        request.predicate = NSPredicate(format: "plant == %@ AND isArchived == NO", plant)
        request.sortDescriptors = [NSSortDescriptor(keyPath: \Note.updatedAt, ascending: false)]

        do {
            return try context.fetch(request)
        } catch {
            print("Error fetching notes by plant: \(error)")
            self.errorMessage = error.localizedDescription
            return []
        }
    }

    /// Fetch note by ID
    func fetchById(_ id: UUID) -> Note? {
        let request: NSFetchRequest<Note> = Note.fetchRequest()
        request.predicate = NSPredicate(format: "id == %@", id as CVarArg)
        request.fetchLimit = 1

        do {
            return try context.fetch(request).first
        } catch {
            print("Error fetching note by ID: \(error)")
            self.errorMessage = error.localizedDescription
            return nil
        }
    }

    /// Fetch archived notes
    func fetchArchived() -> [Note] {
        let request: NSFetchRequest<Note> = Note.fetchRequest()
        request.predicate = NSPredicate(format: "isArchived == YES")
        request.sortDescriptors = [NSSortDescriptor(keyPath: \Note.updatedAt, ascending: false)]

        do {
            return try context.fetch(request)
        } catch {
            print("Error fetching archived notes: \(error)")
            self.errorMessage = error.localizedDescription
            return []
        }
    }

    /// Search notes by title and content
    func search(query: String) -> [Note] {
        guard !query.isEmpty else { return fetchAll() }

        let request: NSFetchRequest<Note> = Note.fetchRequest()
        request.predicate = NSPredicate(
            format: "(title CONTAINS[cd] %@ OR content CONTAINS[cd] %@) AND isArchived == NO",
            query, query
        )
        request.sortDescriptors = [NSSortDescriptor(keyPath: \Note.updatedAt, ascending: false)]

        do {
            return try context.fetch(request)
        } catch {
            print("Error searching notes: \(error)")
            self.errorMessage = error.localizedDescription
            return []
        }
    }

    // MARK: - Create

    @discardableResult
    func create(
        title: String,
        content: String,
        plant: Plant? = nil
    ) -> Note {
        let note = Note(context: context)

        note.id = UUID()
        note.title = title
        note.content = content
        note.plant = plant
        note.isArchived = false
        note.createdAt = Date()
        note.updatedAt = Date()

        save()
        return note
    }

    // MARK: - Update

    func update(
        _ note: Note,
        title: String? = nil,
        content: String? = nil,
        plant: Plant? = nil
    ) {
        if let title = title { note.title = title }
        if let content = content { note.content = content }
        if let plant = plant { note.plant = plant }

        note.updatedAt = Date()
        save()
    }

    // MARK: - Archive

    func archive(_ note: Note) {
        note.isArchived = true
        note.updatedAt = Date()
        save()
    }

    func restore(_ note: Note) {
        note.isArchived = false
        note.updatedAt = Date()
        save()
    }

    // MARK: - Delete

    func delete(_ note: Note) {
        context.delete(note)
        save()
    }

    func deleteById(_ id: UUID) {
        if let note = fetchById(id) {
            delete(note)
        }
    }

    // MARK: - Export

    func exportAsText(_ note: Note) -> String {
        """
        \(note.title)

        \(note.content)

        ---
        Created: \(note.createdAt.formatted())
        Updated: \(note.updatedAt.formatted())
        """
    }

    func exportAsMarkdown(_ note: Note) -> String {
        """
        # \(note.title)

        \(note.content)

        ---
        *Created: \(note.createdAt.formatted())*
        *Updated: \(note.updatedAt.formatted())*
        """
    }

    // MARK: - Save

    private func save() {
        guard context.hasChanges else { return }

        do {
            try context.save()
            _ = fetchAll() // Refresh published notes
        } catch {
            print("Error saving context: \(error)")
            self.errorMessage = error.localizedDescription
        }
    }
}

extension NoteRepository: PlantNoteRepository { }
