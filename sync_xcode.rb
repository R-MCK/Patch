require 'xcodeproj'

project_path = '/Users/ryanmckay/Documents/Patch/Patch.xcodeproj'
project = Xcodeproj::Project.open(project_path)
target = project.targets.find { |t| t.name == 'Patch' }

# Get all .swift files in the target
existing_files = target.source_build_phase.files.map do |build_file|
  if build_file.file_ref.respond_to?(:real_path)
    build_file.file_ref.real_path.to_s
  else
    nil
  end
end.compact

all_swift_files = Dir.glob('/Users/ryanmckay/Documents/Patch/Patch/**/*.swift')

main_group = project.main_group.groups.find { |g| g.name == 'Patch' || g.path == 'Patch' } || project.main_group

added_count = 0

all_swift_files.each do |file_path|
  unless existing_files.include?(file_path)
    puts "Adding to target: #{file_path}"
    
    # check if file ref exists anywhere in the project
    ref = project.files.find { |f| f.real_path.to_s == file_path }
    if ref.nil?
      ref = main_group.new_reference(file_path)
    end
    
    target.source_build_phase.add_file_reference(ref)
    added_count += 1
  end
end

if added_count > 0
  project.save
  puts "Saved project. Added #{added_count} files."
else
  puts "No files needed adding."
end
