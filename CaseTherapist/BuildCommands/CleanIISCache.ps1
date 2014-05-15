#powershell "$(ProjectDir)BuildCommands\CleanIISCache.ps1"
Set-ExecutionPolicy Unrestricted
if(test-path -path $env:userprofile"\Documents\IISExpress\config")
{
    Remove-Item -Recurse -Force $env:userprofile"\Documents\IISExpress\config"
}

$appCmd = "C:\Program Files (x86)\IIS Express\appcmd.exe"
$result = Invoke-Command -Command {& $appCmd 'list' 'sites' '/text:SITE.NAME' }
for ($i=0; $i -lt $result.length; $i++)
{
    Invoke-Command -Command {& $appCmd 'delete' 'site'  $result[$i] }
}

