printf "Current version: ";
awk -F'\"' '/\"version\": \".+\"/{ print $4; exit; }' package.json;
printf "New version: ";
read -r newVersion;
if [[ ! "$newVersion" =~ [0-9]+\.[0-9]+\.[0-9]+ ]]; then
    echo "Invalid version format. Must be like \"[0-9].[0-9].[0-9]\"";
    exit;
fi
sed "-i" "" "-e" "s/\(\"version\": *\"\).*\(\",\)/\1${newVersion}\2/g" package.json;
sed "-i" "" "-e" "s/\(version: *\"\).*\(\"\)/\1${newVersion}\2/g" src/routes/index.js;
sed "-i" "" "-e" "s/\(\"version\": *\"\).*\(\"\)/\1${newVersion}\2/g" config/apidoc/apidoc.json;
tput setaf 2 && echo "✓ Project version updated to ${newVersion}";