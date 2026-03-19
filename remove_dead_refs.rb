require 'xcodeproj'

project_path = '/Users/ryanmckay/Documents/Patch/Patch.xcodeproj'
project = Xcodeproj::Project.open(project_path)

removed_count = 0
project.files.each do |file|
  path = file.real_path.to_s rescue nil
  if path && !File.exist?(path)
    puts "Removing dead reference: #{path}"
    file.remove_from_project
    removed_count += 1
  end
end

if removed_count > 0
  project.save
  puts "Saved project. Removed #{removed_count} dead references."
else
  puts "No dead references found."
end
