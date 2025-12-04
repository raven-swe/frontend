<script lang="ts" setup>
const handleConfirm = () => {
  // Handle the confirm action here
  showToaster('info', 'Confirmed!');
};

const handleCancel = () => {
  // Handle the cancel action here
  showToaster('info', 'Cancelled!');
};
</script>

<template>
  <div>
    <UiAlertDialog>
      <UiAlertDialogTrigger as-child>
        <UiButton>{{ 'Open Alert Dialog' }}</UiButton>
      </UiAlertDialogTrigger>
      <UiAlertDialogContent>
        <UiAlertDialogHeader>
          <UiAlertDialogTitle>
            {{ 'Log out of @Ahmedamrnabil2?' }}
          </UiAlertDialogTitle>
          <UiAlertDialogDescription>
            {{
              "This will only apply to this account, and you'll still be logged in to your other accounts. "
            }}
          </UiAlertDialogDescription>
        </UiAlertDialogHeader>
        <UiAlertDialogFooter>
          <UiAlertDialogAction @click="handleConfirm">
            {{ 'Continue' }}
          </UiAlertDialogAction>
          <UiAlertDialogCancel @click="handleCancel">
            {{ 'Cancel' }}
          </UiAlertDialogCancel>
        </UiAlertDialogFooter>
      </UiAlertDialogContent>
    </UiAlertDialog>
  </div>
</template>
