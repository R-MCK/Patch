require 'xcodeproj'

project_path = '/Users/ryanmckay/Documents/Patch/Patch.xcodeproj'
project = Xcodeproj::Project.open(project_path)
target = project.targets.find { |t| t.name == 'Patch' }

seen_paths = {}
duplicates_removed = 0

target.source_build_phase.files.to_a.each do |build_file|
  path = nil
  if build_file.file_ref.respond_to?(:real_path)
    path = build_file.file_ref.real_path.to_s
  elsif build_file.file_ref.respond_to?(:path)
    path = build_file.file_ref.path.to_s
  end
  
  if path
    if seen_paths[path]
      puts "Removing duplicate build file for: #{path}"
      build_file.remove_from_project
      duplicates_removed += 1
    else
      seen_paths[path] = true
    end
  end
end

if duplicates_removed > 0
  project.save
  puts "Saved project. Removed #{duplicates_removed} duplicate references."
else
  puts "No duplicates found."
end
